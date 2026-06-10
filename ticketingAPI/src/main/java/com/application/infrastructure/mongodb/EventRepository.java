package com.application.infrastructure.mongodb;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends MongoRepository<EventDocument, String> {

    boolean existsByName(String name);

    Optional<EventDocument> findFirstByName(String name);

}
