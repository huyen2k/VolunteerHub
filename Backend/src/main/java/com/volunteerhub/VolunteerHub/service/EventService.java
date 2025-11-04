package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventApprovalRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventMapper;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    private EventMapper eventMapper;

    //Get all events, anyone can use this service
    public List<EventResponse> getEvents() {
        return eventRepository.findAll().stream().map(eventMapper::toEventResponse).toList();
    }

    //Get a specific event by id
    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return eventMapper.toEventResponse(event);
    }

    //Creat new event, user can create but need to be approved by admin or manager
    public EventResponse createEvent(EventCreationRequest request) {
        log.info(request.toString());
        Event event = eventMapper.toEvent(request);
        log.info(event.toString());
        event.setCreatedAt(new Date());
        event.setUpdatedAt(new Date());
        event.setStatus("pending");
        event.setApprovedBy(null);
        event.setApprovedAt(null);

        eventRepository.save(event);
        return eventMapper.toEventResponse(event);
    }

    //Update an event, still need to wait for approval
    public EventResponse updateEvent(String id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        eventMapper.updateEvent(event, request);
        event.setStatus("pending");
        event.setUpdatedAt(new Date());

        eventRepository.save(event);
        return eventMapper.toEventResponse(event);
    }

    //Delete an event, only admin can use this service
    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }

    //Approve event
    public EventResponse approveEvent(String id, EventApprovalRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!event.getStatus().equals("pending")) {
            throw new RuntimeException("Event is not pending");
        }

        event.setStatus(request.getStatus());

        //Will be updated to has specific username who approved the event when role is completed
        event.setApprovedBy("admin");

        if ("approved".equals(request.getStatus())) {
            event.setApprovedAt(new Date());
        }

        eventRepository.save(event);
        return eventMapper.toEventResponse(event);
    }
}
