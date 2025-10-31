package com.volunteerhub.VolunteerHub.repository;
import com.volunteerhub.VolunteerHub.entity.Event;
import com.volunteerhub.VolunteerHub.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface EventRepository extends MongoRepository<Event, ObjectId> {
}
