package com.application.infrastructure.mongodb;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Document(collection = "events")
public class EventDocument {

    @Id
    private String id;
    private String name;
    private String description;
    private Date eventDate;
    private String eventBanner;

    public EventDocument(String name, String description, Date eventDate, String eventBanner) {
        this.name = name;
        this.description = description;
        this.eventDate = eventDate;
        this.eventBanner = eventBanner;
    }
}
