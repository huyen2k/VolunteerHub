package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.entity.Event;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface  EventMapper {
    Event toEvent(EventCreationRequest eventCreationRequest);
}
