package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Channel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelRepository extends MongoRepository<Channel, String> {
    boolean existsByEventId(String eventId);
    Channel findByEventId(String eventId);
}