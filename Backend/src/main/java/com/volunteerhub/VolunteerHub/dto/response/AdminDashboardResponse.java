package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminDashboardResponse {
    long totalUsers;
    long totalVolunteers;
    long activeUsers;

    long totalEvents;
    long pendingEvents;
    long upcomingEvents;

    long totalPosts;
    long newPostsToday;
}