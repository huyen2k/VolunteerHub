package com.volunteerhub.VolunteerHub.collection;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    String id;

    String userId; 

    String type; // 'event_status', 'post_activity', 'comment_activity', 'system', 'registration_status'

    String message;

    @Builder.Default
    Boolean isRead = false;

    @CreatedDate
    Date createdAt;
}

