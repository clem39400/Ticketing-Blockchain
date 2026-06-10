package com.application.uscases.Buyer;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.application.api.dto.EventInfo;
import com.application.infrastructure.mongodb.EventDocument;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

/**
 * Recherche un event par son nom et construit la vue acheteur (event + tickets).
 */
@Component
public class LookupEventInfoUsecase {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    public LookupEventInfoUsecase(EventRepository eventRepository, TicketRepository ticketRepository) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
    }

    /**
     * @return les infos de l'event (avec ses tickets), ou {@code null} si l'event est inconnu
     */
    public EventInfo lookupEventInfo(String eventName) {
        Optional<EventDocument> event = eventRepository.findFirstByName(eventName);
        if (event.isEmpty()) {
            return null;
        }
        return EventInfo.from(event.get(), ticketRepository.findByEventName(eventName));
    }
}
