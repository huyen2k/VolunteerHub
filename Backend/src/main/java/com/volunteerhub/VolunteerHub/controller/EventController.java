package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.service.EventService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    @PreAuthorize("hasRole{'ADMIN'}")
    public List<Event> getAllEvents() {
        return eventService.getEvents();
    }

    @PostMapping
    @PreAuthorize("hasRole{'ADMIN'}")
    public Event createEvent(@RequestBody EventCreationRequest eventCreationRequest) {
        return eventService.createEvent(eventCreationRequest);
    }

    @GetMapping("{/id}")
    public Event getEvent(@PathVariable String id) {
        return eventService.getEventById(id);
    }

    @PostMapping("{/id}")
    public Event updateEvent(@PathVariable String id, @RequestBody EventUpdateRequest eventUpdateRequest) {
        return eventService.updateEvent(id, eventUpdateRequest);
    }
}
