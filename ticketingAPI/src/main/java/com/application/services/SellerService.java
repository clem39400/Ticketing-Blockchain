package com.application.services;

import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;

import com.application.uscases.Seller.CollectETHFromTicketUsecase;
import com.application.uscases.Seller.CreateTicketUsecase;
import com.application.uscases.Seller.SetupEventUsecase;

@Service
public class SellerService {

    private final SetupEventUsecase setupEventUsecase;
    private final CreateTicketUsecase createTicketUsecase;
    private final CollectETHFromTicketUsecase collectETHFromTicketUsecase;

    public SellerService(SetupEventUsecase setupEventUsecase, CreateTicketUsecase createTicketUsecase,
            CollectETHFromTicketUsecase collectETHFromTicketUsecase) {
        this.setupEventUsecase = setupEventUsecase;
        this.createTicketUsecase = createTicketUsecase;
        this.collectETHFromTicketUsecase = collectETHFromTicketUsecase;
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

    public List<String> collectEth(String eventName) throws Exception {
        return collectETHFromTicketUsecase.collectEth(eventName);
    }
}
