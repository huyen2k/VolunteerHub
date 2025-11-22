package com.volunteerhub.VolunteerHub.dto.request.Notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationCreationRequest {
    private String userId;
    private String type; // 'event_status', 'post_activity', 'comment_activity', 'system', 'registration_status'
    private String message;
}

