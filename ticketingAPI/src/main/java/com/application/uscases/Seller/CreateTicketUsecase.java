package com.application.uscases.Seller;

import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;
import org.springframework.stereotype.Component;

@Component
public class CreateTicketUsecase {

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    public CreateTicketUsecase(EventRepository eventRepository, TicketRepository ticketRepository) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
    }

    public boolean createTicket(
            String eventName,
            String ticketName,
            String description,
            int quantity,
            double price,
            Long onChainTokenId) {

        if (!eventRepository.existsByName(eventName)) {
            return false;
        }
        TicketDocument ticket = new TicketDocument(eventName, ticketName, description, quantity, price);
        ticket.setOnChainTokenId(onChainTokenId);
        ticketRepository.insert(ticket);
        return true;

    }
}
