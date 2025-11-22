package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventRegistrationResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventRegistrationMapper;
import com.volunteerhub.VolunteerHub.repository.EventRegistrationRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventRegistrationService {
    @Autowired
    EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    EventRegistrationMapper eventRegistrationMapper;

    @Autowired
    NotificationService notificationService;

    @Autowired
    EventRepository eventRepository;

    public EventRegistrationResponse createRegistration(EventRegistrationCreationRequest request){
        if(eventRegistrationRepository.existsByEventIdAndUserId(request.getEventId(), request.getUserId())){
            throw new AppException(ErrorCode.REGISTRATION_EXISTED);
        }

        EventRegistration eventRegistration = eventRegistrationMapper.toEventRegistration(request);
        eventRegistration.setStatus("pending");

        eventRegistrationRepository.save(eventRegistration);

        try {
            Event event = eventRepository.findById(request.getEventId()).orElse(null);
            if (event != null && event.getCreatedBy() != null) {
                notificationService.createNotificationForUser(
                        event.getCreatedBy(),
                        "event_registration",
                        "Có đăng ký mới cho sự kiện của bạn"
                );
            }
        } catch (Exception ignored) {}

        return eventRegistrationMapper.toEventRegistrationResponse(eventRegistration);
    }

    public EventRegistrationResponse updateRegistration(String registrationId, EventRegistrationUpdateRequest request){
        EventRegistration eventRegistration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_EXISTED));
        
        String oldStatus = eventRegistration.getStatus();
        eventRegistrationMapper.updateEventRegistration(eventRegistration, request);
        eventRegistrationRepository.save(eventRegistration);

        // Create notification if status changed to approved or rejected
        if (!oldStatus.equals(request.getStatus()) && 
            ("approved".equals(request.getStatus()) || "rejected".equals(request.getStatus()))) {
            
            Event event = eventRepository.findById(eventRegistration.getEventId())
                    .orElse(null);
            
            String eventTitle = event != null ? event.getTitle() : "sự kiện";
            String message = "approved".equals(request.getStatus())
                ? String.format("Đăng ký của bạn cho sự kiện '%s' đã được duyệt", eventTitle)
                : String.format("Đăng ký của bạn cho sự kiện '%s' đã bị từ chối", eventTitle);
            
            notificationService.createNotificationForUser(
                eventRegistration.getUserId(),
                "registration_status",
                message
            );
        }

        return eventRegistrationMapper.toEventRegistrationResponse(eventRegistration);
    }

    public EventRegistrationResponse getRegistration(String registrationId){
        EventRegistration eventRegistration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_EXISTED));
        return eventRegistrationMapper.toEventRegistrationResponse(eventRegistration);
    }

    public void deleteRegistration(String registrationId){
        eventRegistrationRepository.deleteById(registrationId);
    }

    public List<EventRegistrationResponse> getRegistrationsByEvent(String eventId) {
        return eventRegistrationRepository.findByEventId(eventId).stream()
                .map(eventRegistrationMapper::toEventRegistrationResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<EventRegistrationResponse> getRegistrationsByUser(String userId) {
        return eventRegistrationRepository.findByUserId(userId).stream()
                .map(eventRegistrationMapper::toEventRegistrationResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}