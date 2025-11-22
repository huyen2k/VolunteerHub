package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import com.volunteerhub.VolunteerHub.collection.User;
import com.volunteerhub.VolunteerHub.constant.Roles;
import com.volunteerhub.VolunteerHub.dto.response.StatisticsResponse;
import com.volunteerhub.VolunteerHub.repository.EventRegistrationRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import com.volunteerhub.VolunteerHub.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StatisticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    public StatisticsResponse getUserStatistics() {
        try {
        List<User> allUsers = userRepository.findAll();
        
        long totalUsers = allUsers.size();
        long totalVolunteers = allUsers.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains(Roles.VOLUNTEER.name()))
                .count();
        long totalManagers = allUsers.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains(Roles.EVEN_MANAGER.name()))
                .count();
        long totalAdmins = allUsers.stream()
                .filter(u -> u.getRoles() != null && u.getRoles().contains(Roles.ADMIN.name()))
                .count();

        Map<String, Long> usersByRole = new HashMap<>();
        usersByRole.put("volunteer", totalVolunteers);
        usersByRole.put("manager", totalManagers);
        usersByRole.put("admin", totalAdmins);

        return StatisticsResponse.builder()
                .totalUsers(totalUsers)
                .totalVolunteers(totalVolunteers)
                .totalManagers(totalManagers)
                .totalAdmins(totalAdmins)
                .usersByRole(usersByRole)
                .build();
        } catch (Exception e) {
            lombok.extern.slf4j.Slf4j.class.getDeclaredMethods(); // keep lombok
            log.error("Error in getUserStatistics", e);
            return StatisticsResponse.builder()
                    .totalUsers(0L)
                    .totalVolunteers(0L)
                    .totalManagers(0L)
                    .totalAdmins(0L)
                    .usersByRole(new java.util.HashMap<String, Long>())
                    .build();
        }
    }

    public StatisticsResponse getEventStatistics(String managerId) {
        try {
        List<Event> allEvents = managerId != null 
            ? eventRepository.findAll().stream()
                .filter(e -> managerId.equals(e.getCreatedBy()))
                .collect(Collectors.toList())
            : eventRepository.findAll();

        long totalEvents = allEvents.size();
        long pendingEvents = allEvents.stream().filter(e -> "pending".equals(e.getStatus())).count();
        long approvedEvents = allEvents.stream().filter(e -> "approved".equals(e.getStatus())).count();
        long rejectedEvents = allEvents.stream().filter(e -> "rejected".equals(e.getStatus())).count();
        long completedEvents = allEvents.stream().filter(e -> "completed".equals(e.getStatus())).count();

        Map<String, Long> eventsByStatus = new HashMap<>();
        eventsByStatus.put("pending", pendingEvents);
        eventsByStatus.put("approved", approvedEvents);
        eventsByStatus.put("rejected", rejectedEvents);
        eventsByStatus.put("completed", completedEvents);

        List<EventRegistration> allRegistrations = eventRegistrationRepository.findAll();
        long totalRegistrations = allRegistrations.size();
        long pendingRegistrations = allRegistrations.stream().filter(r -> "pending".equals(r.getStatus())).count();
        long approvedRegistrations = allRegistrations.stream().filter(r -> "approved".equals(r.getStatus())).count();
        long completedRegistrations = allRegistrations.stream().filter(r -> "completed".equals(r.getStatus())).count();

        return StatisticsResponse.builder()
                .totalEvents(totalEvents)
                .pendingEvents(pendingEvents)
                .approvedEvents(approvedEvents)
                .rejectedEvents(rejectedEvents)
                .completedEvents(completedEvents)
                .eventsByStatus(eventsByStatus)
                .totalRegistrations(totalRegistrations)
                .pendingRegistrations(pendingRegistrations)
                .approvedRegistrations(approvedRegistrations)
                .completedRegistrations(completedRegistrations)
                .build();
        } catch (Exception e) {
            log.error("Error in getEventStatistics", e);
            return StatisticsResponse.builder()
                    .totalEvents(0L)
                    .pendingEvents(0L)
                    .approvedEvents(0L)
                    .rejectedEvents(0L)
                    .completedEvents(0L)
                    .eventsByStatus(new java.util.HashMap<String, Long>())
                    .totalRegistrations(0L)
                    .pendingRegistrations(0L)
                    .approvedRegistrations(0L)
                    .completedRegistrations(0L)
                    .build();
        }
    }

    public StatisticsResponse getOverviewStatistics() {
        try {
        List<User> allUsers = userRepository.findAll();
        List<Event> allEvents = eventRepository.findAll();
        List<EventRegistration> allRegistrations = eventRegistrationRepository.findAll();

        // Recent events (last 7 days)
        Date sevenDaysAgo = new Date(System.currentTimeMillis() - 7 * 24 * 60 * 60 * 1000L);
        long recentEvents = allEvents.stream()
                .filter(e -> e.getCreatedAt() != null && e.getCreatedAt().after(sevenDaysAgo))
                .count();

        // Upcoming events (next 7 days)
        Date now = new Date();
        Date sevenDaysFromNow = new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000L);
        long upcomingEvents = allEvents.stream()
                .filter(e -> e.getDate() != null && e.getDate().after(now) && e.getDate().before(sevenDaysFromNow))
                .count();

        // Active volunteers (with at least one registration)
        Set<String> activeVolunteerIds = allRegistrations.stream()
                .map(EventRegistration::getUserId)
                .collect(Collectors.toSet());
        long activeVolunteers = activeVolunteerIds.size();

        // Recent event summaries (last 5 events)
        List<StatisticsResponse.EventSummary> recentEventSummaries = allEvents.stream()
                .sorted((e1, e2) -> {
                    if (e1.getCreatedAt() == null) return 1;
                    if (e2.getCreatedAt() == null) return -1;
                    return e2.getCreatedAt().compareTo(e1.getCreatedAt());
                })
                .limit(5)
                .map(e -> {
                    long registrationCount = allRegistrations.stream()
                            .filter(r -> e.getId().equals(r.getEventId()))
                            .count();
                    return StatisticsResponse.EventSummary.builder()
                            .id(e.getId())
                            .title(e.getTitle())
                            .registrationCount(registrationCount)
                            .status(e.getStatus())
                            .build();
                })
                .collect(Collectors.toList());

        // Top volunteers (by completed events)
        Map<String, Long> volunteerCompletedCount = allRegistrations.stream()
                .filter(r -> "completed".equals(r.getStatus()))
                .collect(Collectors.groupingBy(
                        EventRegistration::getUserId,
                        Collectors.counting()
                ));

        List<StatisticsResponse.TopVolunteer> topVolunteers = volunteerCompletedCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    String userId = entry.getKey();
                    User user = userRepository.findById(userId).orElse(null);
                    long totalEventCount = allRegistrations.stream()
                            .filter(r -> userId.equals(r.getUserId()))
                            .count();
                    return StatisticsResponse.TopVolunteer.builder()
                            .userId(userId)
                            .fullName(user != null ? user.getFull_name() : "Unknown")
                            .eventCount(totalEventCount)
                            .completedCount(entry.getValue())
                            .build();
                })
                .collect(Collectors.toList());

        return StatisticsResponse.builder()
                .recentEvents(recentEvents)
                .upcomingEvents(upcomingEvents)
                .activeVolunteers(activeVolunteers)
                .recentEventSummaries(recentEventSummaries)
                .topVolunteers(topVolunteers)
                .build();
        } catch (Exception e) {
            log.error("Error in getOverviewStatistics", e);
            return StatisticsResponse.builder()
                    .recentEvents(0L)
                    .upcomingEvents(0L)
                    .activeVolunteers(0L)
                    .recentEventSummaries(new java.util.ArrayList<StatisticsResponse.EventSummary>())
                    .topVolunteers(new java.util.ArrayList<StatisticsResponse.TopVolunteer>())
                    .build();
        }
    }
}

