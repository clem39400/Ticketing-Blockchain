package com.application.infrastructure;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "tickets")
public class TicketDocument {
    @Id
    private String id;
    private String eventName;
    private String name;
    private String description;
    private int quantity;
    private double price;

    public TicketDocument(String eventName, String name, String description, int quantity, double price) {
        this.eventName = eventName;
        this.name = name;
        this.description = description;
        this.quantity = quantity;
        this.price = price;
    }
}
