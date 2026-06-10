package com.application.uscases.Seller;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.blockchain.BlockchainService;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

/**
 * Collecte l'ETH accumule sur les contrats Ticket d'un event : appelle
 * {@code withdraw()} sur chaque contrat deploye (le solde part vers le owner,
 * i.e. le compte deployeur de la plateforme).
 */
@Component
public class CollectETHFromTicketUsecase {

    private static final Logger log = LoggerFactory.getLogger(CollectETHFromTicketUsecase.class);

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final BlockchainService blockchainService;

    public CollectETHFromTicketUsecase(EventRepository eventRepository, TicketRepository ticketRepository,
            BlockchainService blockchainService) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.blockchainService = blockchainService;
    }

    /**
     * Retire l'ETH de tous les contrats des tickets de l'event.
     *
     * @return les hashes des transactions de retrait (un par contrat)
     * @throws NoSuchElementException si l'event est introuvable (404)
     * @throws Exception              si une transaction blockchain echoue (500)
     */
    public List<String> collectEth(String eventName) throws Exception {
        if (!eventRepository.existsByName(eventName)) {
            throw new NoSuchElementException("Event '" + eventName + "' introuvable");
        }

        List<String> txHashes = new ArrayList<>();
        for (TicketDocument ticket : ticketRepository.findByEventName(eventName)) {
            String contractAddress = ticket.getContractAddress();
            if (contractAddress == null || contractAddress.isBlank()) {
                continue;
            }
            String txHash = blockchainService.withdraw(contractAddress);
            log.info("ETH collecte sur le contrat {} du ticket '{}' (tx {})",
                    contractAddress, ticket.getName(), txHash);
            txHashes.add(txHash);
        }
        return txHashes;
    }
}
