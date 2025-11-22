package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventRegistrationResponse {
    String id;
    String eventId;
    String  userId;
    String status; // 'pending', 'approved', 'canceled', 'completed'

    @CreatedDate
    Date registeredAt;

    @LastModifiedDate
    Date updatedAt;
}
