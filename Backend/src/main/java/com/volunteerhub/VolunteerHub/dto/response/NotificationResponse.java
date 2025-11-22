package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String userId;
    String type;
    String message;
    Boolean isRead;

    @CreatedDate
    Date createdAt;
}

