package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Registration; // Đảm bảo bạn đã có Entity Registration
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRepository extends MongoRepository<Registration, String> {

    @Query(value = "{ 'eventId': ?0 }", count = true)
    long countByEventId(String eventId);

    @Query(value = "{ 'eventId': ?0, 'status': ?1 }", count = true)
    long countByEventIdAndStatus(String eventId, String status);

    List<Registration> findByEventId(String eventId);

    boolean existsByEventIdAndUserId(String eventId, String userId);

    Registration findByEventIdAndUserId(String eventId, String userId);
}