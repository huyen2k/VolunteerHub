package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Notification.NotificationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.NotificationResponse;
import com.volunteerhub.VolunteerHub.service.NotificationService;
import com.volunteerhub.VolunteerHub.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications() {
        String userId = userService.getMyInfo().getId();

        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getNotifications(userId))
                .build();
    }

    @GetMapping("/unread")
    public ApiResponse<List<NotificationResponse>> getUnreadNotifications() {
        String userId = userService.getMyInfo().getId();

        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getUnreadNotifications(userId))
                .build();
    }

    @GetMapping("/unread/count")
    public ApiResponse<Long> getUnreadCount() {
        String userId = userService.getMyInfo().getId();

        return ApiResponse.<Long>builder()
                .result(notificationService.getUnreadCount(userId))
                .build();
    }

    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable String id) {
        String userId = userService.getMyInfo().getId();

        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.markAsRead(id, userId))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('APPROVE_EVENT', 'UPDATE_EVENT', 'DELETE_USER') or hasRole('ADMIN')")
    public ApiResponse<NotificationResponse> createNotification(@RequestBody NotificationCreationRequest request) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.createNotification(request))
                .build();
    }
}

