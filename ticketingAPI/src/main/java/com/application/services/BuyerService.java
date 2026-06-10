package com.application.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.application.api.dto.EventInfo;
import com.application.uscases.Buyer.BuyTicketEUUsecase;
import com.application.uscases.Buyer.ListEventsUsecase;
import com.application.uscases.Buyer.LookupEventInfoUsecase;

@Service
public class BuyerService {

    private final LookupEventInfoUsecase lookupEventInfoUsecase;
    private final ListEventsUsecase listEventsUsecase;
    private final BuyTicketEUUsecase buyTicketEUUsecase;

    public BuyerService(LookupEventInfoUsecase lookupEventInfoUsecase, ListEventsUsecase listEventsUsecase,
            BuyTicketEUUsecase buyTicketEUUsecase) {
        this.lookupEventInfoUsecase = lookupEventInfoUsecase;
        this.listEventsUsecase = listEventsUsecase;
        this.buyTicketEUUsecase = buyTicketEUUsecase;
    }

    public EventInfo lookupEventInfo(String eventName) {
        return lookupEventInfoUsecase.lookupEventInfo(eventName);
    }

    public List<EventInfo> listEvents() {
        return listEventsUsecase.listEvents();
    }

    public String buyTicketEur(String eventName, String ticketName, int quantity, String buyerAddress)
            throws Exception {
        return buyTicketEUUsecase.buyTicketEur(eventName, ticketName, quantity, buyerAddress);
    }
}
