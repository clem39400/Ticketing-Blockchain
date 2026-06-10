package com.application.uscases.Buyer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.application.api.dto.EventInfo;
import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.mongodb.EventDocument;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

@ExtendWith(MockitoExtension.class)
class LookupEventInfoUsecaseTest {

    @Mock
    EventRepository eventRepository;

    @Mock
    TicketRepository ticketRepository;

    @InjectMocks
    LookupEventInfoUsecase usecase;

    @Test
    void retourne_event_avec_ses_tickets() {
        EventDocument event = new EventDocument("Concert", "test", new Date(), null);
        when(eventRepository.findFirstByName("Concert")).thenReturn(Optional.of(event));
        when(ticketRepository.findByEventName("Concert"))
                .thenReturn(List.of(new TicketDocument("Concert", "VIP", "Premier rang", 100, 49.99)));

        EventInfo info = usecase.lookupEventInfo("Concert");

        assertThat(info).isNotNull();
        assertThat(info.name()).isEqualTo("Concert");
        assertThat(info.tickets()).hasSize(1);
        assertThat(info.tickets().get(0).name()).isEqualTo("VIP");
        assertThat(info.tickets().get(0).price()).isEqualTo(49.99);
    }

    @Test
    void retourne_null_si_event_absent() {
        when(eventRepository.findFirstByName("Inconnu")).thenReturn(Optional.empty());

        EventInfo info = usecase.lookupEventInfo("Inconnu");

        assertThat(info).isNull();
        verify(ticketRepository, never()).findByEventName(any());
    }
}
