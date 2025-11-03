package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventMapper;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    private EventMapper eventMapper;

    public List<Event> getEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(EventCreationRequest request) {
        Event event = eventMapper.toEvent(request);
        event.setCreatedAt(new Date());
        event.setUpdatedAt(new Date());
        event.setStatus("pending");
        event.setApprovedBy(null);

        return eventRepository.save(event);
    }

    public Event getEventById(String id) {
        return eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public Event updateEvent(String id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        eventMapper.updateEvent(event, request);
        return eventRepository.save(event);
    }
}
