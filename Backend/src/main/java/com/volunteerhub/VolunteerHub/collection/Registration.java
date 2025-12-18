package com.volunteerhub.VolunteerHub.collection;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.TypeAlias;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "event_registrations")
@TypeAlias("com.volunteerhub.VolunteerHub.collection.EventRegistration")
public class Registration {
    @Id
    private String id;

    private String eventId;
    private String userId;

    private String status;
    private Date registeredAt;

    private Integer rating;
    private String review;
}