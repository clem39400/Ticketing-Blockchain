package com.application.uscases.Seller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigInteger;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.application.infrastructure.TicketDocument;
import com.application.infrastructure.blockchain.BlockchainService;
import com.application.infrastructure.mongodb.EventRepository;
import com.application.infrastructure.mongodb.TicketRepository;

@ExtendWith(MockitoExtension.class)
class CreateTicketUsecaseTest {

    @Mock
    EventRepository eventRepository;

    @Mock
    TicketRepository ticketRepository;

    @Mock
    BlockchainService blockchainService;

    @InjectMocks
    CreateTicketUsecase usecase;

    @Test
    void createTicket_ok_quand_event_existe() throws Exception {
        when(eventRepository.existsByName("Concert")).thenReturn(true);
        when(ticketRepository.findByEventName("Concert")).thenReturn(List.of());
        when(blockchainService.deployTicketContract(any(), any(), any(), any())).thenReturn("0xabc");

        boolean result = usecase.createTicket("Concert", "VIP", "Premier rang", 100, 0.05);

        assertThat(result).isTrue();
        // 1er type de ticket -> tokenId auto-incremente a 0
        verify(blockchainService).deployTicketContract(BigInteger.ZERO,
                BigInteger.valueOf(50_000_000_000_000_000L), BigInteger.valueOf(100), "ipfs://Concert/VIP");

        ArgumentCaptor<TicketDocument> captor = ArgumentCaptor.forClass(TicketDocument.class);
        verify(ticketRepository).insert(captor.capture());
        assertThat(captor.getValue().getContractAddress()).isEqualTo("0xabc");
        assertThat(captor.getValue().getOnChainTokenId()).isEqualTo(0L);
    }

    @Test
    void createTicket_refuse_quand_event_absent() throws Exception {
        when(eventRepository.existsByName("Inconnu")).thenReturn(false);

        boolean result = usecase.createTicket("Inconnu", "VIP", "Premier rang", 100, 0.05);

        assertThat(result).isFalse();
        verify(blockchainService, never()).deployTicketContract(any(), any(), any(), any());
        verify(ticketRepository, never()).insert(any(TicketDocument.class));
    }
}
