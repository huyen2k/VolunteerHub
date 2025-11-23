package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRegistrationRepository extends MongoRepository<EventRegistration, String> {
    boolean existsByEventId(String eventId);
    boolean existsByUserId(String userId);
    boolean existsByEventIdAndUserId(String eventId, String userId);
    java.util.List<EventRegistration> findByEventId(String eventId);
    java.util.List<EventRegistration> findByUserId(String userId);
}
