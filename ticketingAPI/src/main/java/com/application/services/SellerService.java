package com.application.services;

import java.util.Date;

import org.springframework.stereotype.Service;

import com.application.uscases.Seller.CreateTicketUsecase;
import com.application.uscases.Seller.SetupEventUsecase;

@Service
public class SellerService {

    private final SetupEventUsecase setupEventUsecase;
    private final CreateTicketUsecase createTicketUsecase;

    public SellerService(SetupEventUsecase setupEventUsecase, CreateTicketUsecase createTicketUsecase) {
        this.setupEventUsecase = setupEventUsecase;
        this.createTicketUsecase = createTicketUsecase;

    }

    public boolean setupEvent(
            String name,
            String description,
            Date eventDate,
            String eventBanner,
            String contractAddress) {

        return setupEventUsecase.setupEvent(name, description, eventDate, eventBanner, contractAddress);

    }

    public boolean createTicket(
            String eventName,
            String ticketName,
            String description,
            int quantity,
            double price) {
        return createTicketUsecase.createTicket(eventName, ticketName, description, quantity, price);
    }
}
