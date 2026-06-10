package com.application.infrastructure.mongodb;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

/**
 * Verifie la connexion a MongoDB au demarrage de l'application.
 * Un simple "ping" ne suffit pas (il passe meme sans auth) : on fait aussi
 * une lecture reelle (count) qui valide l'authentification et la bonne base.
 */
@Component
public class MongoConnectionHealthCheck implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MongoConnectionHealthCheck.class);

    private final MongoTemplate mongoTemplate;
    private final EventRepository eventRepository;

    public MongoConnectionHealthCheck(MongoTemplate mongoTemplate, EventRepository eventRepository) {
        this.mongoTemplate = mongoTemplate;
        this.eventRepository = eventRepository;
    }

    @Override
    public void run(String... args) {
        try {
            mongoTemplate.getDb().runCommand(new Document("ping", 1));
            long count = eventRepository.count(); // necessite auth + bonne base
            log.info("Connexion MongoDB OK -- base '{}', collection 'events' : {} doc(s)",
                    mongoTemplate.getDb().getName(), count);
        } catch (Exception e) {
            log.error("Connexion MongoDB ECHOUEE : {}", e.toString());
        }
    }
}
