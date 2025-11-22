package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserStatsResponse {
    Long totalEventsRegistered;
    Long completedEvents;
    Long pendingEvents;
    Long approvedEvents;
    Long totalPosts;
    Long totalComments;
    Long totalLikes;
}

