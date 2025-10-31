package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.entity.Event;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class EventService{
    @Autowired
    private EventRepository eventRepository;

    public List<Event> allEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        event.setCreatedAt(Instant.now());
        event.setUpdatedAt(Instant.now());
        event.setStatus("pending");

        event.setCreatedBy(new ObjectId("652f8a3b7e8a4c1fbc24e123"));
        return eventRepository.save(event);
    }
}
