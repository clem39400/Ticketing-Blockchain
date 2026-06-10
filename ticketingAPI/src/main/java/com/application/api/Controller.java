package com.application.api;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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
                        @RequestParam(required = true) double price) {

                boolean created = sellerService.createTicket(eventName, ticketName, description, quantity, price);

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

        @GetMapping("/events")
        public ResponseEntity<List<EventInfo>> getEvents() {
                return ResponseEntity.ok(buyerService.listEvents());
        }

        @PostMapping("/buy-ticket-eur")
        public ResponseEntity<Map<String, String>> buyTicketEur(
                        @RequestParam(required = true) String eventName,
                        @RequestParam(required = true) String ticketName,
                        @RequestParam(required = true) int quantity,
                        @RequestParam(required = true) String buyerAddress) {
                try {
                        String txHash = buyerService.buyTicketEur(eventName, ticketName, quantity, buyerAddress);
                        return ResponseEntity.ok(Map.of("txHash", txHash));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", String.valueOf(e.getMessage())));
                } catch (NoSuchElementException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(Map.of("error", String.valueOf(e.getMessage())));
                } catch (Exception e) {
                        return ResponseEntity.internalServerError()
                                        .body(Map.of("error", String.valueOf(e.getMessage())));
                }
        }

        @PostMapping("/collect-eth")
        public ResponseEntity<Map<String, Object>> collectEth(
                        @RequestParam(required = true) String eventName) {
                try {
                        List<String> txHashes = sellerService.collectEth(eventName);
                        return ResponseEntity.ok(Map.of("txHashes", txHashes));
                } catch (NoSuchElementException e) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(Map.of("error", String.valueOf(e.getMessage())));
                } catch (Exception e) {
                        return ResponseEntity.internalServerError()
                                        .body(Map.of("error", String.valueOf(e.getMessage())));
                }
        }
}
