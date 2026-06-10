package com.application.uscases.Buyer;

import java.util.List;

import org.springframework.stereotype.Component;

import com.application.api.dto.EventInfo;
import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.mongodb.EventDocument;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

@Component
public class LookupEventInfoUsecase {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    public LookupEventInfoUsecase(EventRepository eventRepository, TicketRepository ticketRepository) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
    }

    public EventInfo lookupEventInfo(String eventName) {
        EventDocument event = eventRepository.findFirstByName(eventName);
        if (event == null) {
            return null;
        }

        List<TicketDocument> tickets = ticketRepository.findByEventName(eventName);
        return EventInfo.from(event, tickets);
    }
}
