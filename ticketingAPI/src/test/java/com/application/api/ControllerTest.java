package com.application.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.application.api.dto.EventInfo;
import com.application.services.BuyerService;
import com.application.services.SellerService;

@WebMvcTest(Controller.class)
class ControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    SellerService sellerService;

    @MockitoBean
    BuyerService buyerService;

    @Test
    void setupEvent_retourne_200_si_ok() throws Exception {
        when(sellerService.setupEvent(any(), any(), any(), any(), any())).thenReturn(true);

        mockMvc.perform(post("/setup-event")
                .param("name", "Concert")
                .param("description", "test")
                .param("eventDate", "2026-07-01"))
                .andExpect(status().isOk());
    }

    @Test
    void createTicket_retourne_500_si_echec() throws Exception {
        when(sellerService.createTicket(any(), any(), any(), anyInt(), anyDouble())).thenReturn(false);

        mockMvc.perform(post("/create-ticket")
                .param("eventName", "Concert")
                .param("ticketName", "VIP")
                .param("description", "Premier rang")
                .param("quantity", "100")
                .param("price", "49.99"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void eventInfo_retourne_200_avec_le_json() throws Exception {
        EventInfo info = new EventInfo("Concert", "test", null, null, "0x145997d3db24319792efc6995ff90e9bea1e101e",
                List.of(new EventInfo.TicketInfo("VIP", "Premier rang", 100, 49.99, 2L,
                        "0x145997d3db24319792efc6995ff90e9bea1e101e")));
        when(buyerService.lookupEventInfo("Concert")).thenReturn(info);

        mockMvc.perform(get("/event-info").param("eventName", "Concert"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Concert"))
                .andExpect(jsonPath("$.contractAddress").value("0x145997d3db24319792efc6995ff90e9bea1e101e"))
                .andExpect(jsonPath("$.tickets[0].name").value("VIP"))
                .andExpect(jsonPath("$.tickets[0].onChainTokenId").value(2));
    }

    @Test
    void eventInfo_retourne_404_si_event_absent() throws Exception {
        when(buyerService.lookupEventInfo("Inconnu")).thenReturn(null);

        mockMvc.perform(get("/event-info").param("eventName", "Inconnu"))
                .andExpect(status().isNotFound());
    }
}
