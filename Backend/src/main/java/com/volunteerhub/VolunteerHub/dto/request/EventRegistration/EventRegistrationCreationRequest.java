package com.volunteerhub.VolunteerHub.dto.request.EventRegistration;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "event_registrations")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventRegistrationCreationRequest {

    String eventId;
    String  userId;
}
