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

    // Thống kê User
    public StatisticsResponse getUserStatistics() {
        try {
            long totalUsers = userRepository.count();

            // Dùng countByRolesContains
            long totalVolunteers = userRepository.countByRolesContains(Roles.VOLUNTEER.name());
            long totalManagers = userRepository.countByRolesContains(Roles.EVEN_MANAGER.name());
            long totalAdmins = userRepository.countByRolesContains(Roles.ADMIN.name());

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
            log.error("Error in getUserStatistics", e);
            return StatisticsResponse.builder().build(); // Trả về rỗng an toàn
        }
    }

    // Thống kê Event (Phân biệt Admin và Manager)
    public StatisticsResponse getEventStatistics(String managerId) {
        try {
            long totalEvents, pendingEvents, approvedEvents, rejectedEvents, completedEvents;
            long totalRegistrations, pendingRegistrations, approvedRegistrations, completedRegistrations;

            Map<String, Long> eventsByStatus = new HashMap<>();

            // TRƯỜNG HỢP 1: MANAGER (Xem dữ liệu của chính mình)
            if (managerId != null && !managerId.isEmpty()) {
                // Lấy tất cả sự kiện của Manager này
                List<Event> managerEvents = eventRepository.findByCreatedBy(managerId);

                // Lấy danh sách ID các sự kiện đó (Ví dụ: [id1, id2, id3])
                List<String> eventIds = managerEvents.stream().map(Event::getId).collect(Collectors.toList());

                // Tính toán thống kê Event (Logic Java)
                totalEvents = managerEvents.size();
                pendingEvents = managerEvents.stream().filter(e -> "pending".equals(e.getStatus())).count();
                approvedEvents = managerEvents.stream().filter(e -> "approved".equals(e.getStatus())).count();
                rejectedEvents = managerEvents.stream().filter(e -> "rejected".equals(e.getStatus())).count();
                completedEvents = managerEvents.stream().filter(e -> "completed".equals(e.getStatus())).count();

                // Tính toán thống kê Registration dựa trên danh sách eventIds
                if (eventIds.isEmpty()) {
                    totalRegistrations = 0; pendingRegistrations = 0; approvedRegistrations = 0; completedRegistrations = 0;
                } else {
                    totalRegistrations = eventRegistrationRepository.countByEventIdIn(eventIds);
                    pendingRegistrations = eventRegistrationRepository.countByStatusAndEventIdIn("pending", eventIds);
                    approvedRegistrations = eventRegistrationRepository.countByStatusAndEventIdIn("approved", eventIds);
                    completedRegistrations = eventRegistrationRepository.countByStatusAndEventIdIn("completed", eventIds);
                }
            }
            // TRƯỜNG HỢP 2: ADMIN (Xem toàn bộ hệ thống)
            else {
                // Thống kê Event
                totalEvents = eventRepository.count();
                pendingEvents = eventRepository.countByStatus("pending");
                approvedEvents = eventRepository.countByStatus("approved");
                rejectedEvents = eventRepository.countByStatus("rejected");
                completedEvents = eventRepository.countByStatus("completed");

                // Thống kê Registration
                totalRegistrations = eventRegistrationRepository.count();
                pendingRegistrations = eventRegistrationRepository.countByStatus("pending");
                approvedRegistrations = eventRegistrationRepository.countByStatus("approved");
                completedRegistrations = eventRegistrationRepository.countByStatus("completed");
            }

            eventsByStatus.put("pending", pendingEvents);
            eventsByStatus.put("approved", approvedEvents);
            eventsByStatus.put("rejected", rejectedEvents);
            eventsByStatus.put("completed", completedEvents);

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
            return StatisticsResponse.builder().build();
        }
    }

    // 3. Overview Dashboard

    public StatisticsResponse getOverviewStatistics() {
        try {

            long totalEvents = eventRepository.count();
            long pendingEventsCount = eventRepository.countByStatus("pending");

            Date sevenDaysAgo = new Date(System.currentTimeMillis() - 7 * 24 * 60 * 60 * 1000L);
            long recentEvents = eventRepository.countByCreatedAtAfter(sevenDaysAgo);
            long upcomingEvents = eventRepository.countByDateAfter(new Date());


            List<EventRegistration> allRegistrations = eventRegistrationRepository.findAll();

            Set<String> activeVolunteerIds = allRegistrations.stream()
                    .map(EventRegistration::getUserId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            long activeVolunteers = activeVolunteerIds.size();


            List<Event> top5NewEvents = eventRepository.findTop5ByOrderByCreatedAtDesc();
            List<StatisticsResponse.EventSummary> recentEventSummaries = top5NewEvents.stream()
                    .map(e -> {
                        long registrationCount = eventRegistrationRepository.countByEventId(e.getId());
                        return StatisticsResponse.EventSummary.builder()
                                .id(e.getId())
                                .title(e.getTitle())
                                .registrationCount(registrationCount)
                                .status(e.getStatus())
                                .build();
                    })
                    .collect(Collectors.toList());

            // ---ATTRACTIVE EVENTS (Sự kiện thu hút - Sidebar) ---
            // Logic: Lấy top 5 sự kiện Approved có nhiều người đăng ký nhất
            List<Event> allApprovedEvents = eventRepository.findAll().stream()
                    .filter(e -> "approved".equals(e.getStatus()))
                    .collect(Collectors.toList());

            List<StatisticsResponse.EventSummary> attractiveEvents = allApprovedEvents.stream()
                    .map(e -> {
                        long regCount = eventRegistrationRepository.countByEventId(e.getId());
                        return StatisticsResponse.EventSummary.builder()
                                .id(e.getId())
                                .title(e.getTitle())
                                .registrationCount(regCount)
                                .score(regCount * 10)
                                .status(e.getStatus())
                                .build();
                    })
                    .sorted((e1, e2) -> Long.compare(e2.getScore(), e1.getScore())) // Sắp xếp giảm dần
                    .limit(5)
                    .collect(Collectors.toList());

            // TOP VOLUNTEERS (Tình nguyện viên tích cực)
            List<EventRegistration> completedRegistrations = allRegistrations.stream()
                    .filter(r -> "completed".equals(r.getStatus()))
                    .filter(r -> r.getUserId() != null)
                    .collect(Collectors.toList());

            // Gom nhóm theo UserId và đếm số lượng
            Map<String, Long> volunteerCompletedCount = completedRegistrations.stream()
                    .collect(Collectors.groupingBy(EventRegistration::getUserId, Collectors.counting()));

            // Sắp xếp top 5 và lấy thông tin user
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
                                .fullName(user != null ? user.getFull_name() : "Unknown User")
                                .eventCount(totalEventCount)
                                .completedCount(entry.getValue())
                                .build();
                    })
                    .collect(Collectors.toList());

            // --- TRẢ VỀ KẾT QUẢ ĐẦY ĐỦ ---
            return StatisticsResponse.builder()
                    .totalEvents(totalEvents)
                    .pendingEvents(pendingEventsCount)
                    .recentEvents(recentEvents)
                    .upcomingEvents(upcomingEvents)
                    .activeVolunteers(activeVolunteers)
                    .recentEventSummaries(recentEventSummaries)
                    .attractiveEvents(attractiveEvents)
                    .topVolunteers(topVolunteers)
                    .build();

        } catch (Exception e) {
            log.error("Error in getOverviewStatistics", e);

            return StatisticsResponse.builder()
                    .totalEvents(0L)
                    .pendingEvents(0L)
                    .recentEventSummaries(new ArrayList<>())
                    .attractiveEvents(new ArrayList<>())
                    .topVolunteers(new ArrayList<>())
                    .build();
        }
    }
}