package com.application.uscases.Seller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Date;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.application.infrastructure.mongodb.EventDocument;
import com.application.infrastructure.mongodb.EventRepository;

@ExtendWith(MockitoExtension.class)
class SetupEventUsecaseTest {

    @Mock
    EventRepository eventRepository;

    @InjectMocks
    SetupEventUsecase usecase;

    @Test
    void setupEvent_persiste_et_retourne_true() {
        boolean result = usecase.setupEvent("Concert", "test", new Date(), null, "0xabc");

        assertThat(result).isTrue();
        verify(eventRepository).insert(any(EventDocument.class));
    }

    @Test
    void setupEvent_retourne_false_si_erreur_db() {
        when(eventRepository.insert(any(EventDocument.class)))
                .thenThrow(new RuntimeException("db down"));

        boolean result = usecase.setupEvent("Concert", "test", new Date(), null, "0xabc");

        assertThat(result).isFalse();
    }
}
