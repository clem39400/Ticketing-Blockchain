package com.application.api;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.application.api.dto.EventInfo;
import com.application.services.BuyerService;
import com.application.services.SellerService;

@RestController
public class Controller {

    @Autowired
    SellerService sellerService;

    @Autowired
    BuyerService buyerService;

    @PostMapping("/setup-event")
    public ResponseEntity<Void> setupEvent(
            @RequestParam(required = true) String name,
            @RequestParam(required = true) String description,
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date eventDate,
            @RequestParam(required = false) String eventBanner,
            @RequestParam(required = false) String contractAddress) {
        boolean created = sellerService.setupEvent(name, description, eventDate, eventBanner, contractAddress);
        return created
                ? ResponseEntity.ok().build()
                : ResponseEntity.internalServerError().build();
    }

    @PostMapping("/create-ticket")
    public ResponseEntity<Void> createTicket(
            @RequestParam(required = true) String eventName,
            @RequestParam(required = true) String ticketName,
            @RequestParam(required = true) String description,
            @RequestParam(required = true) int quantity,
            @RequestParam(required = true) double price,
            @RequestParam(required = false) Long onChainTokenId) {

        boolean created = sellerService.createTicket(eventName, ticketName, description, quantity, price, onChainTokenId);

        return created
                ? ResponseEntity.ok().build()
                : ResponseEntity.internalServerError().build();
    }

    @GetMapping("/event-info")
    public ResponseEntity<EventInfo> getEventInfo(
            @RequestParam(required = true) String eventName) {

        EventInfo eventInfo = buyerService.lookupEventInfo(eventName);

        return eventInfo != null
                ? ResponseEntity.ok(eventInfo)
                : ResponseEntity.notFound().build();
    }
}
