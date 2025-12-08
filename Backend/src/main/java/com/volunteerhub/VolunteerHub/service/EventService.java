package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Event;
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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventMapper eventMapper;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private com.volunteerhub.VolunteerHub.service.UserService userService;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private PostRepository postRepository;

    //Get all events, anyone can use this service
    public List<EventResponse> getEvents() {
        return eventRepository.findAll().stream().map(this::toEnrichedResponse).toList();
    }

    //Get events by manager
    public List<EventResponse> getEventsByManager(String managerId) {
        log.info("Dang tim kiem su kien cho Manager ID: " + managerId);
        var events = eventRepository.findByCreatedBy(managerId);

        return events.stream()
                .map(this::toEnrichedResponse)
                .toList();
    }

    //Get a specific event by id
    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return toEnrichedResponse(event);
    }

    //Creat new event, user can create but need to be approved by admin or manager
    public EventResponse createEvent(EventCreationRequest request) {
        log.info("Create Event Request: " + request.toString());
        Event event = eventMapper.toEvent(request);

        event.setStatus("pending");
        event.setApprovedBy(null);
        event.setApprovedAt(null);

        var currentUser = userService.getMyInfo();
        event.setCreatedBy(currentUser.getId());

        if (event.getCreatedBy() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        eventRepository.save(event);
        return toEnrichedResponse(event);
    }

    //Update an event, still need to wait for approval
    public EventResponse updateEvent(String id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        eventMapper.updateEvent(event, request);
        event.setStatus("pending");
//        event.setUpdatedAt(new Date());

        eventRepository.save(event);
        return toEnrichedResponse(event);
    }

    //Delete an event, only admin can use this service
    public void deleteEvent(String id) {
        eventRepository.deleteById(id);
    }

    //Approve event
    public EventResponse approveEvent(String id, EventApprovalRequest request) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!event.getStatus().equals("pending")) {
            throw new RuntimeException("Event is not pending");
        }

        event.setStatus(request.getStatus());

        try {
            var currentUser = userService.getMyInfo();
            event.setApprovedBy(currentUser.getId());
        } catch (Exception e) {
            event.setApprovedBy("admin");
        }

        if ("approved".equals(request.getStatus())) {
            event.setApprovedAt(new Date());
        }

        eventRepository.save(event);

        // Create notification for event creator
        String message = "approved".equals(request.getStatus()) 
            ? String.format("Sự kiện '%s' của bạn đã được duyệt", event.getTitle())
            : String.format("Sự kiện '%s' của bạn đã bị từ chối", event.getTitle());
        
        notificationService.createNotificationForUser(
            event.getCreatedBy(),
            "event_status",
            message
        );

        return toEnrichedResponse(event);
    }

    private EventResponse toEnrichedResponse(Event event) {
        Long likes = 0L;
        Long comments = 0L;
        try {
            var channel = channelRepository.findByEventId(event.getId());
            if (channel != null) {
                var posts = postRepository.findByChannelId(channel.getId());
                for (var p : posts) {
                    if (p.getLikesCount() != null) likes += p.getLikesCount();
                    if (p.getCommentsCount() != null) comments += p.getCommentsCount();
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

        Integer registered = null;
        try {
            if (event.getRegisteredUsers() != null) {
                registered = event.getRegisteredUsers().size();
            } else {
                registered = event.getVolunteersRegistered();
            }
        } catch (Exception ignored) {}

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
                .volunteersRegistered(registered)
                .likes(likes)
                .comments(comments)
                .shares(0L)
                .contactName(contactName)
                .contactEmail(contactEmail)
                .contactPhone(contactPhone)
                .build();
    }
}
