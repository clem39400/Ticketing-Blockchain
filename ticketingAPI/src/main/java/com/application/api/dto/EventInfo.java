package com.application.api.dto;

import java.util.Date;
import java.util.List;

import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.mongodb.EventDocument;

/**
 * Vue "infos event" pour un acheteur : les details de l'event + les tickets
 * disponibles.
 */
public record EventInfo(
                String name,
                String description,
                Date eventDate,
                String eventBanner,
                String contractAddress,
                List<TicketInfo> tickets) {

        public record TicketInfo(
                        String name,
                        String description,
                        int quantity,
                        double price,
                        Long onChainTokenId,
                        String contractAddress) {
        }

        public static EventInfo from(EventDocument event, List<TicketDocument> tickets) {
                List<TicketInfo> ticketInfos = tickets.stream()
                                .map(t -> new TicketInfo(t.getName(), t.getDescription(), t.getQuantity(),
                                                t.getPrice(), t.getOnChainTokenId(), t.getContractAddress()))
                                .toList();

                return new EventInfo(
                                event.getName(),
                                event.getDescription(),
                                event.getEventDate(),
                                event.getEventBanner(),
                                event.getContractAddress(),
                                ticketInfos);
        }
}
