package com.application.uscases.Seller;

import java.math.BigDecimal;
import java.math.BigInteger;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.web3j.utils.Convert;

import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.blockchain.BlockchainService;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

@Component
public class CreateTicketUsecase {

    private static final Logger log = LoggerFactory.getLogger(CreateTicketUsecase.class);

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final BlockchainService blockchainService;

    public CreateTicketUsecase(EventRepository eventRepository, TicketRepository ticketRepository,
            BlockchainService blockchainService) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.blockchainService = blockchainService;
    }

    /**
     * Cree un type de ticket pour un event : deploie un contrat ERC-1155 dedie
     * (avec sa quantite et son prix) puis persiste le ticket en base.
     *
     * <p>L'event est identifie par son nom. Le {@code tokenId} on-chain est
     * auto-incremente par event (0 pour le 1er type de ticket, 1 pour le suivant, ...).</p>
     */
    public boolean createTicket(
            String eventName,
            String ticketName,
            String description,
            int quantity,
            double price) {

        if (!eventRepository.existsByName(eventName)) {
            return false;
        }

        // tokenId auto-incremente par event = nombre de types de tickets deja crees.
        long tokenId = ticketRepository.findByEventName(eventName).size();
        BigInteger priceWei = Convert.toWei(BigDecimal.valueOf(price), Convert.Unit.ETHER).toBigIntegerExact();
        String uri = "ipfs://" + eventName + "/" + ticketName;

        String contractAddress;
        try {
            contractAddress = blockchainService.deployTicketContract(
                    BigInteger.valueOf(tokenId), priceWei, BigInteger.valueOf(quantity), uri);
        } catch (Exception e) {
            log.error("Deploiement du contrat pour le ticket '{}' de l'event '{}' echoue", ticketName, eventName, e);
            return false;
        }

        TicketDocument ticket = new TicketDocument(eventName, ticketName, description, quantity, price);
        ticket.setOnChainTokenId(tokenId);
        ticket.setContractAddress(contractAddress);
        ticketRepository.insert(ticket);
        return true;
    }
}
