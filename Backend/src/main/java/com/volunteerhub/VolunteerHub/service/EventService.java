package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventMapper;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventMapper eventMapper;

    public List<EventResponse> getEvents() {
        return eventRepository.findAll().stream().map(eventMapper::toEventResponse).toList();
    }

    public EventResponse createEvent(EventCreationRequest request) {
        log.info(request.toString());
        Event event = eventMapper.toEvent(request);
        log.info(event.toString());
        event.setCreatedAt(new Date());
        event.setUpdatedAt(new Date());
        event.setStatus("pending");
        event.setApprovedBy(null);

        eventRepository.save(event);
        return eventMapper.toEventResponse(event);
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return eventMapper.toEventResponse(event);
    }

    public EventResponse updateEvent(String id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        eventMapper.updateEvent(event, request);
        eventRepository.save(event);
        return eventMapper.toEventResponse(event);
    }
}
