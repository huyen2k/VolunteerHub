package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Event.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventApprovalRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import com.volunteerhub.VolunteerHub.service.EventService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PutMapping("/{id}")
    public ApiResponse<EventResponse> updateEvent(@PathVariable String id, @RequestBody EventUpdateRequest eventUpdateRequest) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.updateEvent(id, eventUpdateRequest))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole{'ADMIN'}")
    public ApiResponse<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ApiResponse.<Void>builder().build();
    }

    /*Approve Controller, will be upgraded to add approvedBy more specific when Role entity is completed
    *Add reject API, set life time for rejected event and filter for single role to display event
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole{'ADMIN'}")
    public ApiResponse<EventResponse> approveEvent(@PathVariable String id,
                                                   @RequestBody EventApprovalRequest eventApprovalRequest) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.approveEvent(id, eventApprovalRequest))
                .build();
    }
}
