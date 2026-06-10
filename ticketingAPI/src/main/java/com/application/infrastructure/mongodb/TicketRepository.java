package com.application.infrastructure.mongodb;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.application.infrastructure.TicketDocument;

@Repository
public interface TicketRepository extends MongoRepository<TicketDocument, String> {

    List<TicketDocument> findByEventName(String eventName);

    Optional<TicketDocument> findFirstByEventNameAndName(String eventName, String name);

}
