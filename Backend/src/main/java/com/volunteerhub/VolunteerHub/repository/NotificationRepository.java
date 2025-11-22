package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    Optional<Notification> findByIdAndUserId(String id, String userId);
    Long countByUserIdAndIsReadFalse(String userId);
}

