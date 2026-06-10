package com.application.uscases.Buyer;

import java.util.List;

import org.springframework.stereotype.Component;

import com.application.api.dto.EventInfo;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

/**
 * Liste tous les events connus avec leurs tickets respectifs.
 */
@Component
public class ListEventsUsecase {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    public ListEventsUsecase(EventRepository eventRepository, TicketRepository ticketRepository) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<EventInfo> listEvents() {
        return eventRepository.findAll().stream()
                .map(event -> EventInfo.from(event, ticketRepository.findByEventName(event.getName())))
                .toList();
    }
}
