package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventRegistrationResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventRegistrationMapper;
import com.volunteerhub.VolunteerHub.repository.EventRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EventRegistrationService {
    @Autowired
    EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    EventRegistrationMapper eventRegistrationMapper;

    public EventRegistrationResponse createRegistration(EventRegistrationCreationRequest request){
        if(eventRegistrationRepository.existsByEventIdAndUserId(request.getEventId(), request.getUserId())){
            throw new AppException(ErrorCode.REGISTRATION_EXISTED);
        }

        EventRegistration eventRegistration = eventRegistrationMapper.toEventRegistration(request);
        eventRegistration.setStatus("pending");

        eventRegistrationRepository.save(eventRegistration);

        return eventRegistrationMapper.toEventRegistrationResponse(eventRegistration);
    }

    public EventRegistrationResponse updateRegistration(String registrationId, EventRegistrationUpdateRequest request){
        EventRegistration eventRegistration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new AppException(ErrorCode.REGISTRATION_NOT_EXISTED));
        eventRegistrationMapper.updateEventRegistration(eventRegistration, request);
        eventRegistrationRepository.save(eventRegistration);
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
}