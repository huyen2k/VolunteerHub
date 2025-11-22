package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticsResponse {

    Long totalUsers;
    Long totalVolunteers;
    Long totalManagers;
    Long totalAdmins;
    Map<String, Long> usersByRole;

    // Event
    Long totalEvents;
    Long pendingEvents;
    Long approvedEvents;
    Long rejectedEvents;
    Long completedEvents;
    Map<String, Long> eventsByStatus;

    // Registration 
    Long totalRegistrations;
    Long pendingRegistrations;
    Long approvedRegistrations;
    Long completedRegistrations;

    // Overview 
    Long recentEvents; 
    Long upcomingEvents; 
    Long activeVolunteers; // Volunteers 
    List<EventSummary> recentEventSummaries;
    List<TopVolunteer> topVolunteers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class EventSummary {
        String id;
        String title;
        Long registrationCount;
        String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TopVolunteer {
        String userId;
        String fullName;
        Long eventCount;
        Long completedCount;
    }
}

