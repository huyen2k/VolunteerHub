package com.volunteerhub.VolunteerHub.service;

<<<<<<< HEAD
import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.collection.Post;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventApprovalRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.AdminDashboardResponse;
import com.volunteerhub.VolunteerHub.dto.response.DashboardStatsResponse;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventMapper;
import com.volunteerhub.VolunteerHub.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventService {

    EventRepository eventRepository;
    RegistrationRepository registrationRepository;
    UserRepository userRepository;
    ChannelRepository channelRepository;
    PostRepository postRepository;

    EventMapper eventMapper;
    NotificationService notificationService;
    UserService userService;
    FileUploadService fileUploadService;

    // --- HELPER METHODS ---
    private int safeInt(Integer val) { return val == null ? 0 : val; }
    private long safeLong(Long val) { return val == null ? 0L : val; }

    // ========================================================================
    // 1. DASHBOARD STATISTICS (TỐI ƯU HÓA: DÙNG COUNT TRONG DB)
    // ========================================================================

    public AdminDashboardResponse getAdminDashboardStats() {
        try {
            // 1. User Stats (Dùng count database cực nhanh)
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countByIsActive(true);
            long totalVolunteers = userRepository.countByRolesContains("VOLUNTEER");

            // 2. Event Stats
            long totalEvents = eventRepository.count();
            long pendingEvents = eventRepository.countByStatus("pending");

            Date now = new Date();
            long upcomingEvents = eventRepository.countUpcomingEvents(now);

            // 3. Post Stats
            long totalPosts = postRepository.count();

            // Tính bài viết trong ngày hôm nay
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0);
            Date startOfDay = cal.getTime();

            cal.set(Calendar.HOUR_OF_DAY, 23); cal.set(Calendar.MINUTE, 59); cal.set(Calendar.SECOND, 59);
            Date endOfDay = cal.getTime();

            long newPostsToday = postRepository.countPostsBetween(startOfDay, endOfDay);

            return AdminDashboardResponse.builder()
                    .totalUsers(totalUsers).totalVolunteers(totalVolunteers).activeUsers(activeUsers)
                    .totalEvents(totalEvents).pendingEvents(pendingEvents).upcomingEvents(upcomingEvents)
                    .totalPosts(totalPosts).newPostsToday(newPostsToday)
                    .build();
        } catch (Exception e) {
            log.error("Error in Admin Stats: ", e);
            return new AdminDashboardResponse();
        }
    }

    public DashboardStatsResponse getDashboardStats() {
        try {
            // Lấy tất cả sự kiện Approved để tính toán thống kê chung cho User
            List<Event> approvedEvents = eventRepository.findByStatus("approved");
            // Dùng chung hàm logic "Hết ngày mới kết thúc"
            return calculateStatsFromList(approvedEvents);
        } catch (Exception e) {
            log.error("Error in Dashboard Stats: ", e);
            return new DashboardStatsResponse();
        }
    }

    public DashboardStatsResponse getManagerDashboardStats() {
        // Manager cần tính toán trên danh sách sự kiện của chính mình
        // Vì số lượng sự kiện của 1 manager thường không quá lớn (<100), ta có thể fetch list
        // Hoặc tối ưu hơn là viết thêm countByCreatedByAndStatus trong Repo (tạm thời dùng list)
        try {
            var currentUser = userService.getMyInfo();
            List<Event> events = eventRepository.findByCreatedBy(currentUser.getId());
            return calculateStatsFromList(events);
        } catch (Exception e) {
            return new DashboardStatsResponse();
        }
    }

    private DashboardStatsResponse calculateStatsFromList(List<Event> events) {
        if (events == null) return new DashboardStatsResponse();
        long total = events.size();
        long pending = 0, upcoming = 0, happening = 0, completed = 0;
        Date now = new Date();

        for (Event ev : events) {
            if (ev.getStatus() == null) continue;
            if ("pending".equals(ev.getStatus())) {
                pending++;
            } else if ("approved".equals(ev.getStatus())) {
                Date start = ev.getDate(); // Giả sử là 08:00 sáng
                if (start == null) continue;

                // 1. Tạo mốc kết thúc ngày: 23:59:59
                Calendar cal = Calendar.getInstance();
                cal.setTime(start);
                cal.set(Calendar.HOUR_OF_DAY, 23);
                cal.set(Calendar.MINUTE, 59);
                cal.set(Calendar.SECOND, 59);
                cal.set(Calendar.MILLISECOND, 999);
                Date endOfDay = cal.getTime();

                // 2. Phân loại logic:
                if (now.after(endOfDay)) {
                    // Thời gian hiện tại đã qua 23:59:59 của ngày diễn ra
                    completed++;
                } else if (now.after(start) || now.equals(start)) {
                    // Thời gian hiện tại đã đến giờ bắt đầu VÀ chưa qua hết ngày
                    // (Vì điều kiện now.after(endOfDay) đã loại bỏ trường hợp kết thúc ở trên)
                    happening++;
                } else {
                    // Thời gian hiện tại vẫn còn trước giờ start
                    upcoming++;
                }
            }
        }
        return DashboardStatsResponse.builder()
                .totalEvents(total).pendingEvents(pending).upcomingEvents(upcoming)
                .happeningEvents(happening).completedEvents(completed).build();
    }

    // ========================================================================
    // 2. QUERY EVENTS (TỐI ƯU HÓA: PAGINATION & LIMIT)
    // ========================================================================

    // API mới: Lấy danh sách có phân trang (Thay thế getAllEvents cũ)
    public Page<EventResponse> getEvents(String keyword, int page, int size, boolean isAdmin) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        // Xử lý keyword null
        String searchKey = (keyword == null) ? "" : keyword;

        if (isAdmin) {
            // Admin: Tìm trong TẤT CẢ sự kiện (kể cả pending, rejected)
            if (searchKey.isEmpty()) {
                return eventRepository.findAll(pageable).map(this::toEnrichedResponse);
            } else {
                return eventRepository.searchAllEvents(searchKey, pageable).map(this::toEnrichedResponse);
            }
        } else {
            // User thường: Chỉ tìm trong APPROVED
            if (searchKey.isEmpty()) {
                return eventRepository.findByStatus("approved", pageable).map(this::toEnrichedResponse);
            } else {
                return eventRepository.searchApprovedEvents(searchKey, pageable).map(this::toEnrichedResponse);
            }
        }
    }

    // Giữ lại hàm cũ cho Admin nhưng dùng List (cẩn thận nếu dữ liệu lớn)
    public List<EventResponse> getEventsForAdmin() {
        return eventRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream().map(this::toEnrichedResponse).collect(Collectors.toList());
    }

    public List<EventResponse> getMyEvents() {
        try {
            var currentUser = userService.getMyInfo();
            // Lấy list của manager, sắp xếp mới nhất trước
            return eventRepository.findByCreatedBy(currentUser.getId()).stream()
                    .sorted(Comparator.comparing(Event::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .map(this::toEnrichedResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) { return new ArrayList<>(); }
    }

    public List<EventResponse> getTopNewEvents() {
        // Sử dụng hàm tối ưu trong Repo: chỉ lấy 5 cái
        return eventRepository.findTop5ByStatusOrderByCreatedAtDesc("approved").stream()
                .map(this::toEnrichedResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getPendingEvents() {
        // Dùng Pagination để giới hạn lấy 20 cái đầu tiên, tránh load cả nghìn cái pending
        Pageable limit = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        return eventRepository.findByStatus("pending", limit)
                .stream()
                .map(this::toEnrichedResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getTopAttractiveEvents() {
        // Lấy top 50 để lọc, đảm bảo hiệu năng
        Pageable limit = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));

        return eventRepository.findByStatus("approved", limit).stream()
                .map(this::toEnrichedResponse)
                .sorted((a, b) -> {
                    // Công thức: (TNV * 3) + (Comments * 1)
                    long scoreA = (safeInt(a.getVolunteersRegistered()) * 3L) + (safeLong(a.getComments()) * 1L);
                    long scoreB = (safeInt(b.getVolunteersRegistered()) * 3L) + (safeLong(b.getComments()) * 1L);
                    return Long.compare(scoreB, scoreA);
                })
                .limit(5)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toEnrichedResponse(event);
    }

    // ========================================================================
    // 3. MUTATION (GIỮ NGUYÊN LOGIC NGHIỆP VỤ)
    // ========================================================================

    public EventResponse createEvent(EventCreationRequest request) {
        Event event = eventMapper.toEvent(request);
        event.setStatus("pending");
        if (event.getImage() == null || event.getImage().isEmpty()) {
            event.setImage("https://images.unsplash.com/photo-1559027615-cd4628902d4a");
        }
        try { event.setCreatedBy(userService.getMyInfo().getId()); } catch (Exception ignored) {}

        eventRepository.save(event);
        return toEnrichedResponse(event);
    }

    public EventResponse updateEvent(String id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        eventMapper.updateEvent(event, request);
        event.setStatus("pending"); // Reset về pending khi sửa
        eventRepository.save(event);
        return toEnrichedResponse(event);
    }

    public void deleteEvent(String id) { eventRepository.deleteById(id); }

    public EventResponse approveEvent(String id, EventApprovalRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        event.setStatus(request.getStatus());
        try { event.setApprovedBy(userService.getMyInfo().getId()); } catch (Exception e) { event.setApprovedBy("admin"); }

        if ("approved".equals(request.getStatus())) {
            event.setApprovedAt(new Date());
            try {
                if (!channelRepository.existsByEventId(event.getId())) {
                    Channel ch = new Channel(); ch.setEventId(event.getId()); ch.setName("Thảo luận: " + event.getTitle()); ch.setType("EVENT_DISCUSSION"); ch.setCreatedAt(new Date()); channelRepository.save(ch);
                    Post p = new Post(); p.setChannelId(ch.getId()); p.setContent("Chào mừng!"); p.setAuthorName("Hệ thống"); p.setCreatedAt(new Date()); postRepository.save(p);
                }
            } catch (Exception ignored) {}
        }
        eventRepository.save(event);
        return toEnrichedResponse(event);
    }

    public EventResponse rejectEvent(String id, String reason) {
        EventApprovalRequest req = new EventApprovalRequest(); req.setStatus("rejected");
        return approveEvent(id, req);
    }

    public String uploadEventImage(String eventId, MultipartFile file) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        try {
            String url = fileUploadService.uploadImage(file);
            event.setImage(url);
            eventRepository.save(event);
            return url;
        } catch (Exception e) { throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); }
    }

    // ========================================================================
    // 4. HELPER (NULL-SAFE RESPONSE MAPPING)
    // ========================================================================

    private EventResponse toEnrichedResponse(Event event) {
        if (event == null) return null;
        Long likes = 0L; Long comments = 0L;
        try {
            // Tối ưu: Dùng existsByEventId trước khi find để nhanh hơn nếu ko cần detail
            if (channelRepository != null && event.getId() != null) {
                var ch = channelRepository.findByEventId(event.getId()).orElse(null);
                if (ch != null) {
                    // Tối ưu: Nếu PostRepository có countByChannelId thì dùng cái đó sẽ nhanh hơn
                    long count = postRepository.countByChannelId(ch.getId());
                    comments = count;
                }
            }
        } catch (Exception ignored) {}

        long realReg = 0;
        try {
            if (registrationRepository != null && event.getId() != null)
                realReg = registrationRepository.countByEventIdAndStatus(event.getId(), "approved") +
                        registrationRepository.countByEventIdAndStatus(event.getId(), "completed");
        } catch (Exception ignored) {}

        return EventResponse.builder()
                .id(event.getId()).title(event.getTitle()).description(event.getDescription())
                .date(event.getDate()).location(event.getLocation()).category(event.getCategory())
                .image(event.getImage()).status(event.getStatus()).createdBy(event.getCreatedBy())
                .createdAt(event.getCreatedAt()).updatedAt(event.getUpdatedAt())
                .volunteersNeeded(safeInt(event.getVolunteersNeeded()))
                .volunteersRegistered((int) realReg).likes(likes).comments(comments).build();
    }
}
=======
import com.volunteerhub.VolunteerHub.dto.request.EventCreationRequest;
import com.volunteerhub.VolunteerHub.entity.Event;
import com.volunteerhub.VolunteerHub.mapper.EventMapper;
import com.volunteerhub.VolunteerHub.mapper.UserMapper;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import org.apache.tomcat.util.net.openssl.ciphers.Authentication;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class EventService{
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private EventMapper eventMapper;

    public List<Event> allEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(EventCreationRequest request) {

        Event event = eventMapper.toEvent(request);
        event.setCreatedAt(new Date());
        event.setUpdatedAt(new Date());
        event.setApprovedBy(null);

        event.setStatus("Approved");

        return eventRepository.save(event);
    }
}
>>>>>>> Hieu
