package com.application.uscases.Seller;

import java.util.Date;

import org.springframework.stereotype.Component;

import com.application.infrastructure.mongodb.EventDocument;
import com.application.infrastructure.mongodb.EventRepository;

@Component
public class SetupEventUsecase {

    private final EventRepository repository;

    public SetupEventUsecase(EventRepository repository) {
        this.repository = repository;
    }

    public boolean setupEvent(
            String name,
            String description,
            Date eventDate,
            String eventBanner) {

        EventDocument event = new EventDocument(name, description, eventDate, eventBanner);
        try {
            repository.insert(event);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
