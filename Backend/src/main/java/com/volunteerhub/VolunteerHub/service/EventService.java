package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.collection.Post;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventApprovalRequest;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.EventMapper;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import com.volunteerhub.VolunteerHub.repository.PostRepository;
import com.volunteerhub.VolunteerHub.repository.RegistrationRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile; // Thêm import này

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventService {

    EventRepository eventRepository;
    RegistrationRepository registrationRepository;
    EventMapper eventMapper;
    NotificationService notificationService;
    UserService userService;
    ChannelRepository channelRepository;
    PostRepository postRepository;
    FileUploadService fileUploadService; // Thêm Service này để xử lý upload

    // --- CÁC HÀM CŨ GIỮ NGUYÊN ---

    public List<EventResponse> getEvents() {
        return eventRepository.findAll().stream()
                .filter(event -> "approved".equals(event.getStatus()))
                .map(this::toEnrichedResponse)
                .toList();
    }

    public List<EventResponse> getEventsForAdmin() {
        return eventRepository.findAll().stream()
                .map(this::toEnrichedResponse)
                .toList();
    }

    public List<EventResponse> getAllEventsForAdmin() {
        return getEventsForAdmin();
    }

    public List<EventResponse> getMyEvents() {
        try {
            var currentUser = userService.getMyInfo();
            String currentUserId = currentUser.getId();
            log.info("Querying events for createdBy: " + currentUserId);
            return eventRepository.findByCreatedBy(currentUserId).stream()
                    .map(this::toEnrichedResponse)
                    .toList();
        } catch (Exception e) {
            log.error("Error in getMyEvents: " + e.getMessage());
            return List.of();
        }
    }

    public List<EventResponse> getEventsByManager(String managerId) {
        return eventRepository.findByCreatedBy(managerId).stream()
                .map(this::toEnrichedResponse)
                .toList();
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toEnrichedResponse(event);
    }

    public EventResponse createEvent(EventCreationRequest request) {
        Event event = eventMapper.toEvent(request);
        event.setStatus("pending");
        event.setApprovedBy(null);
        event.setApprovedAt(null);

        if (event.getImage() == null || event.getImage().isEmpty()) {
            event.setImage("https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1000");
        }

        try {
            var currentUser = userService.getMyInfo();
            event.setCreatedBy(currentUser.getId());
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        eventRepository.save(event);
        return toEnrichedResponse(event);
    }

    public EventResponse updateEvent(String id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        eventMapper.updateEvent(event, request);
        event.setStatus("pending");
        eventRepository.save(event);
        return toEnrichedResponse(event);
    }

    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }

    public EventResponse approveEvent(String id, EventApprovalRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        event.setStatus(request.getStatus());

        try {
            var currentUser = userService.getMyInfo();
            event.setApprovedBy(currentUser.getId());
        } catch (Exception e) {
            event.setApprovedBy("admin");
        }

        if ("approved".equals(request.getStatus())) {
            event.setApprovedAt(new Date());
            try {
                if (!channelRepository.existsByEventId(event.getId())) {
                    Channel newChannel = new Channel();
                    newChannel.setEventId(event.getId());
                    newChannel.setName("Thảo luận: " + event.getTitle());
                    newChannel.setType("EVENT_DISCUSSION");
                    newChannel.setPostCount(1);
                    newChannel.setCreatedAt(new Date());

                    Channel savedChannel = channelRepository.save(newChannel);

                    Post welcomePost = new Post();
                    welcomePost.setChannelId(savedChannel.getId());
                    welcomePost.setContent("Chào mừng các bạn đến với kênh thảo luận chính thức của sự kiện!");
                    welcomePost.setAuthorName("Hệ thống");
                    welcomePost.setAuthorAvatar("https://cdn-icons-png.flaticon.com/512/1041/1041883.png");
                    welcomePost.setCreatedAt(new Date());
                    welcomePost.setLikesCount(0L);
                    welcomePost.setCommentsCount(0L);
                    welcomePost.setImages(List.of());

                    postRepository.save(welcomePost);
                    log.info("Đã tạo Channel & Post cho event: " + event.getId());
                }
            } catch (Exception e) {
                log.error("Lỗi tạo Channel/Post tự động: ", e);
            }
        }

        eventRepository.save(event);

        String message = "approved".equals(request.getStatus())
                ? String.format("Sự kiện '%s' của bạn đã được duyệt", event.getTitle())
                : String.format("Sự kiện '%s' của bạn đã bị từ chối", event.getTitle());

        try {
            notificationService.createNotificationForUser(event.getCreatedBy(), "event_status", message);
        } catch (Exception e) {
            log.error("Khong gui duoc thong bao: " + e.getMessage());
        }

        return toEnrichedResponse(event);
    }

    public String uploadEventImage(String eventId, MultipartFile file) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        try {
            String imageUrl = fileUploadService.uploadImage(file);

            // Cập nhật đường dẫn ảnh mới vào database
            event.setImage(imageUrl);
            eventRepository.save(event);

            log.info("Event image updated successfully for ID: " + eventId);
            return imageUrl;
        } catch (Exception e) {
            log.error("Lỗi khi upload ảnh sự kiện: " + e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private EventResponse toEnrichedResponse(Event event) {
        Long likes = 0L;
        Long comments = 0L;
        try {
            var channel = channelRepository.findByEventId(event.getId());
            if (channel != null) {
                var posts = postRepository.findByChannelId(channel.getId());
                comments = (long) posts.size();
                for (var p : posts) {
                    if (p.getLikesCount() != null) likes += p.getLikesCount();
                }
            }
        } catch (Exception ignored) {}

        String contactName = null;
        String contactEmail = null;
        String contactPhone = null;
        try {
            if (event.getCreatedBy() != null) {
                var creator = userService.getUserById(event.getCreatedBy());
                contactName = creator.getFull_name();
                contactEmail = creator.getEmail();
                contactPhone = creator.getPhone();
            }
        } catch (Exception ignored) {}

        long realRegisteredCount = 0;
        try {
            if (registrationRepository != null) {
                long approved = registrationRepository.countByEventIdAndStatus(event.getId(), "approved");
                long completed = registrationRepository.countByEventIdAndStatus(event.getId(), "completed");
                realRegisteredCount = approved + completed;
            }
        } catch (Exception e) {
            log.error("Lỗi đếm số lượng registration: " + e.getMessage());
        }

        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .date(event.getDate())
                .location(event.getLocation())
                .category(event.getCategory())
                .image(event.getImage())
                .status(event.getStatus())
                .createdBy(event.getCreatedBy())
                .approvedBy(event.getApprovedBy())
                .createdAt(event.getCreatedAt())
                .updatedAt(event.getUpdatedAt())
                .volunteersNeeded(event.getVolunteersNeeded())
                .volunteersRegistered((int) realRegisteredCount)
                .likes(likes)
                .comments(comments)
                .shares(0L)
                .contactName(contactName)
                .contactEmail(contactEmail)
                .contactPhone(contactPhone)
                .build();
    }
}