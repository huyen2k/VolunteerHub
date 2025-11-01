package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.entity.Event;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-01T10:06:48+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class EventMapperImpl implements EventMapper {

    @Override
    public Event toEvent(EventCreationRequest eventCreationRequest) {
        if ( eventCreationRequest == null ) {
            return null;
        }

        Event event = new Event();

        return event;
    }
}
