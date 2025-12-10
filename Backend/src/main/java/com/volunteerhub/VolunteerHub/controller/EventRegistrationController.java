package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.EventRegistrationResponse;
import com.volunteerhub.VolunteerHub.service.EventRegistrationService;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registrations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventRegistrationController {
    @Autowired
    EventRegistrationService eventRegistrationService;
    @Autowired
    com.volunteerhub.VolunteerHub.service.UserService userService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_REGISTRATION')")
    ApiResponse<EventRegistrationResponse> createRegistration(@RequestBody EventRegistrationCreationRequest request){
        String userId = userService.getMyInfo().getId();
        request.setUserId(userId);
        return ApiResponse.<EventRegistrationResponse>builder()
                .result(eventRegistrationService.createRegistration(request))
                .build();
    }

    @PutMapping("/{registrationId}")
    @PreAuthorize("hasAuthority('UPDATE_REGISTRATION')")
    ApiResponse<EventRegistrationResponse> updateRegistration(@PathVariable String registrationId, @RequestBody EventRegistrationUpdateRequest request){
        return ApiResponse.<EventRegistrationResponse>builder()
                .result(eventRegistrationService.updateRegistration(registrationId, request))
                .build();
    }

    @GetMapping("/{registrationId}")
    @PreAuthorize("hasAuthority('READ_REGISTRATION')")
    ApiResponse<EventRegistrationResponse> getRegistration(@PathVariable String registrationId){
        return ApiResponse.<EventRegistrationResponse>builder()
                .result(eventRegistrationService.getRegistration(registrationId))
                .build();
    }

    @DeleteMapping("/{registrationId}")
    // Cho phép cả người có quyền CREATE (Volunteer) và DELETE (Admin) được gọi
    @PreAuthorize("hasAuthority('CREATE_REGISTRATION') or hasAuthority('DELETE_REGISTRATION')")
    ApiResponse<Void> delete(@PathVariable String registrationId){
        eventRegistrationService.deleteRegistration(registrationId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @PutMapping("/{registrationId}/status")
    @PreAuthorize("hasAuthority('UPDATE_REGISTRATION')")
    ApiResponse<EventRegistrationResponse> updateRegistrationStatus(@PathVariable String registrationId, @RequestBody EventRegistrationUpdateRequest request){
        return ApiResponse.<EventRegistrationResponse>builder()
                .result(eventRegistrationService.updateRegistration(registrationId, request))
                .build();
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyAuthority('UPDATE_REGISTRATION', 'APPROVE_EVENT', 'USER_LIST')")
    ApiResponse<List<EventRegistrationResponse>> getRegistrationsByEvent(@PathVariable String eventId){
        return ApiResponse.<List<EventRegistrationResponse>>builder()
                .result(eventRegistrationService.getRegistrationsByEvent(eventId))
                .build();
    }

    @GetMapping("/user/{userId}")
    ApiResponse<List<EventRegistrationResponse>> getRegistrationsByUser(@PathVariable String userId){
        return ApiResponse.<List<EventRegistrationResponse>>builder()
                .result(eventRegistrationService.getRegistrationsByUser(userId))
                .build();
    }
}