package com.application.infrastructure.blockchain;

import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;

/**
 * Deploie un contrat ERC-1155 {@code Ticket} par type de ticket et y enregistre
 * la categorie correspondante (prix + stock).
 *
 * <p>Le bytecode de creation provient de {@code resources/contract/Ticket.bin}
 * (l'init code verifie deja deploye sur Sepolia, baseURI = "ipfs://"). Le compte
 * derive de {@code DEPLOYER_PRIVATE_KEY} devient le owner de chaque contrat.</p>
 */
@Component
public class BlockchainService {

    private static final Logger log = LoggerFactory.getLogger(BlockchainService.class);

    // Limites de gas volontairement larges (testnet). Le deploiement du contrat est gros (~14 KB runtime).
    private static final BigInteger DEPLOY_GAS_LIMIT = BigInteger.valueOf(4_000_000L);
    private static final BigInteger CALL_GAS_LIMIT = BigInteger.valueOf(500_000L);
    // Polling du recu : 40 tentatives x 3 s = jusqu'a 2 min par transaction.
    private static final long RECEIPT_POLL_MILLIS = 3_000L;
    private static final int RECEIPT_POLL_ATTEMPTS = 40;

    private final String rpcUrl;
    private final long chainId;
    private final String privateKey;
    private final String creationBytecode;

    public BlockchainService(
            @Value("${blockchain.rpc-url:}") String rpcUrl,
            @Value("${blockchain.chain-id:11155111}") long chainId,
            @Value("${blockchain.deployer-private-key:}") String privateKey,
            @Value("classpath:contract/Ticket.bin") Resource bytecodeResource) throws IOException {
        this.rpcUrl = rpcUrl;
        this.chainId = chainId;
        this.privateKey = privateKey;
        String hex = StreamUtils.copyToString(bytecodeResource.getInputStream(), StandardCharsets.UTF_8).trim();
        this.creationBytecode = hex.startsWith("0x") ? hex.substring(2) : hex;
    }

    /**
     * Deploie un nouveau contrat Ticket et y cree l'unique categorie de ce type de ticket.
     *
     * @param tokenId   identifiant de la categorie sur le contrat (auto-incremente par event)
     * @param priceWei  prix unitaire en wei
     * @param maxSupply nombre de tickets disponibles (stock max)
     * @param uri       URI (metadata) de la categorie
     * @return l'adresse du contrat deploye
     * @throws Exception si la config est absente ou si une transaction echoue
     */
    public String deployTicketContract(BigInteger tokenId, BigInteger priceWei, BigInteger maxSupply, String uri)
            throws Exception {
        if (rpcUrl == null || rpcUrl.isBlank()) {
            throw new IllegalStateException("blockchain.rpc-url (RPC_URL) non configure");
        }
        if (privateKey == null || privateKey.isBlank()) {
            throw new IllegalStateException("blockchain.deployer-private-key (DEPLOYER_PRIVATE_KEY) non configure");
        }

        Web3j web3j = Web3j.build(new HttpService(rpcUrl));
        try {
            Credentials credentials = Credentials.create(privateKey);
            RawTransactionManager txManager = new RawTransactionManager(web3j, credentials, chainId);
            PollingTransactionReceiptProcessor receiptProcessor =
                    new PollingTransactionReceiptProcessor(web3j, RECEIPT_POLL_MILLIS, RECEIPT_POLL_ATTEMPTS);
            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();

            // 1) Deploiement du contrat (transaction de creation, pas de destinataire).
            EthSendTransaction deployTx = txManager.sendTransaction(
                    gasPrice, DEPLOY_GAS_LIMIT, null, creationBytecode, BigInteger.ZERO, true);
            if (deployTx.hasError()) {
                throw new IllegalStateException("Echec deploiement contrat: " + deployTx.getError().getMessage());
            }
            TransactionReceipt deployReceipt =
                    receiptProcessor.waitForTransactionReceipt(deployTx.getTransactionHash());
            String contractAddress = deployReceipt.getContractAddress();
            log.info("Contrat Ticket deploye a {} (tx {})", contractAddress, deployReceipt.getTransactionHash());

            // 2) Creation de la categorie : createCategory(tokenId, price, maxSupply, uri).
            Function createCategory = new Function(
                    "createCategory",
                    List.of(new Uint256(tokenId), new Uint256(priceWei), new Uint256(maxSupply), new Utf8String(uri)),
                    Collections.emptyList());
            EthSendTransaction callTx = txManager.sendTransaction(
                    gasPrice, CALL_GAS_LIMIT, contractAddress, FunctionEncoder.encode(createCategory), BigInteger.ZERO);
            if (callTx.hasError()) {
                throw new IllegalStateException("Echec createCategory: " + callTx.getError().getMessage());
            }
            receiptProcessor.waitForTransactionReceipt(callTx.getTransactionHash());
            log.info("Categorie {} creee sur {} (prix {} wei, stock {})", tokenId, contractAddress, priceWei, maxSupply);

            return contractAddress;
        } finally {
            web3j.shutdown();
        }
    }
}
