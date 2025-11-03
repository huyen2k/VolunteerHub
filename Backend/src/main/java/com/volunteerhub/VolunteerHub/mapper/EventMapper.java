package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventUpdateRequest;
import org.mapstruct.MappingTarget;

public interface EventMapper {
    Event toEvent(EventCreationRequest request);
    void updateEvent(@MappingTarget Event event, EventUpdateRequest request);
}
