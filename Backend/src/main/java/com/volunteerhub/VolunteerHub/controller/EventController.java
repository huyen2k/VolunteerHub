package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
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
    public ApiResponse<List<EventResponse>> getAllEvents() {
        return ApiResponse.<List<EventResponse>>builder()
                        .result(eventService.getEvents())
                                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole{'ADMIN'}")
    public ApiResponse<EventResponse> createEvent(@RequestBody EventCreationRequest eventCreationRequest) {
        return ApiResponse.<EventResponse>builder()
                        .result(eventService.createEvent(eventCreationRequest))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<EventResponse> getEvent(@PathVariable String id) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.getEventById(id))
                .build();
    }

    @PostMapping("/{id}")
    public ApiResponse<EventResponse> updateEvent(@PathVariable String id, @RequestBody EventUpdateRequest eventUpdateRequest) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.updateEvent(id, eventUpdateRequest))
                .build();
    }
}
