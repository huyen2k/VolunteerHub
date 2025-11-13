package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-12T09:28:33+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class EventMapperImpl implements EventMapper {

    @Override
    public Event toEvent(EventCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Event.EventBuilder event = Event.builder();

        event.title( request.getTitle() );
        event.description( request.getDescription() );
        event.date( request.getDate() );
        event.location( request.getLocation() );

        return event.build();
    }

    @Override
    public void updateEvent(Event event, EventUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        event.setTitle( request.getTitle() );
        event.setDescription( request.getDescription() );
        event.setDate( request.getDate() );
        event.setLocation( request.getLocation() );
    }

    @Override
    public EventResponse toEventResponse(Event request) {
        if ( request == null ) {
            return null;
        }

        EventResponse.EventResponseBuilder eventResponse = EventResponse.builder();

        eventResponse.title( request.getTitle() );
        eventResponse.description( request.getDescription() );
        eventResponse.date( request.getDate() );
        eventResponse.location( request.getLocation() );

        return eventResponse.build();
    }
}
