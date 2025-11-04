package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EventMapper {
    Event toEvent(EventCreationRequest request);
    void updateEvent(@MappingTarget Event event, EventUpdateRequest request);
    EventResponse toEventResponse(Event request);
}
