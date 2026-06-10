package com.application.api.dto;

import java.util.ArrayList;
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
                        Long onChainTokenId) {
        }

        public static List<EventInfo> from(List<EventDocument> events, List<TicketDocument> tickets) {
                List<EventInfo> result = new ArrayList<>();
                for (EventDocument event : events) {
                        List<TicketInfo> ticketInfos = tickets.stream()
                                        .map(t -> new TicketInfo(t.getName(), t.getDescription(), t.getQuantity(),
                                                        t.getPrice(),
                                                        t.getOnChainTokenId()))
                                        .toList();

                        result.add(new EventInfo(
                                        event.getName(),
                                        event.getDescription(),
                                        event.getEventDate(),
                                        event.getEventBanner(),
                                        event.getContractAddress(),
                                        ticketInfos));
                }
                return result;

        }
}
