package com.application.uscases.Seller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

@ExtendWith(MockitoExtension.class)
class CreateTicketUsecaseTest {

    @Mock
    EventRepository eventRepository;

    @Mock
    TicketRepository ticketRepository;

    @InjectMocks
    CreateTicketUsecase usecase;

    @Test
    void createTicket_ok_quand_event_existe() {
        when(eventRepository.existsByName("Concert")).thenReturn(true);

        boolean result = usecase.createTicket("Concert", "VIP", "Premier rang", 100, 49.99, 2L);

        assertThat(result).isTrue();
        verify(ticketRepository).insert(any(TicketDocument.class));
    }

    @Test
    void createTicket_refuse_quand_event_absent() {
        when(eventRepository.existsByName("Inconnu")).thenReturn(false);

        boolean result = usecase.createTicket("Inconnu", "VIP", "Premier rang", 100, 49.99, 2L);

        assertThat(result).isFalse();
        verify(ticketRepository, never()).insert(any(TicketDocument.class));
    }
}
