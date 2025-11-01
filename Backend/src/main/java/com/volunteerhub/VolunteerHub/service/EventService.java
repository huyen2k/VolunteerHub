package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.entity.Event;
import com.volunteerhub.VolunteerHub.mapper.EventMapper;
import com.volunteerhub.VolunteerHub.mapper.UserMapper;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
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
    @Autowired
    private EventMapper eventMapper;

    public List<Event> allEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(EventCreationRequest request) {

        Event event = eventMapper.toEvent(request);
        event.setCreatedAt(new Date());
        event.setUpdatedAt(new Date());
        event.setApprovedBy(null);

        event.setStatus("Approved");

        return eventRepository.save(event);
    }
}
