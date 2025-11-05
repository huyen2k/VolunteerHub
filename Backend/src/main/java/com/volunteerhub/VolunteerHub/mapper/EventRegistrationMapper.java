package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventRegistrationResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EventRegistrationMapper {
    EventRegistration toEventRegistration(EventRegistrationCreationRequest request);
    void updateEventRegistration(@MappingTarget EventRegistration EventRegistration, EventRegistrationUpdateRequest request);
    EventRegistrationResponse toEventRegistrationResponse(EventRegistration EventRegistration);
}
