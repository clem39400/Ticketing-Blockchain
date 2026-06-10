package com.application.uscases.Buyer;

import java.math.BigInteger;
import java.util.NoSuchElementException;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.blockchain.BlockchainService;
import com.application.infrastructure.mongodb.TicketRepository;

/**
 * Achat d'un ticket en euros : paiement fiat simule, puis mint des tokens
 * ERC-1155 vers l'adresse de l'acheteur par le compte plateforme (owner).
 */
@Component
public class BuyTicketEUUsecase {

    private static final Logger log = LoggerFactory.getLogger(BuyTicketEUUsecase.class);

    private static final Pattern ETH_ADDRESS_PATTERN = Pattern.compile("^0x[0-9a-fA-F]{40}$");

    private final TicketRepository ticketRepository;
    private final BlockchainService blockchainService;

    public BuyTicketEUUsecase(TicketRepository ticketRepository, BlockchainService blockchainService) {
        this.ticketRepository = ticketRepository;
        this.blockchainService = blockchainService;
    }

    /**
     * Achete {@code quantity} tickets en euros et les mint vers {@code buyerAddress}.
     *
     * @return le hash de la transaction de mint
     * @throws IllegalArgumentException si la quantite ou l'adresse acheteur est invalide (400)
     * @throws NoSuchElementException   si l'event ou le ticket est introuvable (404)
     * @throws Exception                si la transaction blockchain echoue (500)
     */
    public String buyTicketEur(String eventName, String ticketName, int quantity, String buyerAddress)
            throws Exception {

        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity doit etre strictement positif");
        }
        if (buyerAddress == null || !ETH_ADDRESS_PATTERN.matcher(buyerAddress).matches()) {
            throw new IllegalArgumentException("buyerAddress n'est pas une adresse Ethereum valide");
        }

        TicketDocument ticket = ticketRepository.findFirstByEventNameAndName(eventName, ticketName)
                .orElseThrow(() -> new NoSuchElementException(
                        "Ticket '" + ticketName + "' introuvable pour l'event '" + eventName + "'"));

        if (ticket.getContractAddress() == null || ticket.getContractAddress().isBlank()
                || ticket.getOnChainTokenId() == null) {
            throw new IllegalStateException(
                    "Aucun contrat deploye pour le ticket '" + ticketName + "' de l'event '" + eventName + "'");
        }

        // Paiement fiat simule : toujours accepte (pas de PSP branche).
        log.info("Paiement EUR simulé accepté");

        return blockchainService.mintTickets(
                ticket.getContractAddress(),
                buyerAddress,
                BigInteger.valueOf(ticket.getOnChainTokenId()),
                BigInteger.valueOf(quantity));
    }
}
