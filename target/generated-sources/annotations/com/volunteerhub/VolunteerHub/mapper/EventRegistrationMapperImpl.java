package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.EventRegistration.EventRegistrationUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventRegistrationResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-10T20:20:36+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class EventRegistrationMapperImpl implements EventRegistrationMapper {

    @Override
    public EventRegistration toEventRegistration(EventRegistrationCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        EventRegistration.EventRegistrationBuilder eventRegistration = EventRegistration.builder();

        eventRegistration.eventId( request.getEventId() );
        eventRegistration.userId( request.getUserId() );

        return eventRegistration.build();
    }

    @Override
    public void updateEventRegistration(EventRegistration EventRegistration, EventRegistrationUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        EventRegistration.setStatus( request.getStatus() );
    }

    @Override
    public EventRegistrationResponse toEventRegistrationResponse(EventRegistration EventRegistration) {
        if ( EventRegistration == null ) {
            return null;
        }

        EventRegistrationResponse.EventRegistrationResponseBuilder eventRegistrationResponse = EventRegistrationResponse.builder();

        eventRegistrationResponse.id( EventRegistration.getId() );
        eventRegistrationResponse.eventId( EventRegistration.getEventId() );
        eventRegistrationResponse.userId( EventRegistration.getUserId() );
        eventRegistrationResponse.status( EventRegistration.getStatus() );
        eventRegistrationResponse.registeredAt( EventRegistration.getRegisteredAt() );
        eventRegistrationResponse.updatedAt( EventRegistration.getUpdatedAt() );

        return eventRegistrationResponse.build();
    }
}
