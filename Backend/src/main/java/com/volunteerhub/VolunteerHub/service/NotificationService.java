package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Notification;
import com.volunteerhub.VolunteerHub.dto.request.Notification.NotificationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.response.NotificationResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.NotificationMapper;
import com.volunteerhub.VolunteerHub.repository.NotificationRepository;
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
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationMapper notificationMapper;

    public List<NotificationResponse> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    public Long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_EXISTED));

        notification.setIsRead(true);
        notificationRepository.save(notification);

        return notificationMapper.toNotificationResponse(notification);
    }

    public NotificationResponse createNotification(NotificationCreationRequest request) {
        Notification notification = notificationMapper.toNotification(request);
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());

        notificationRepository.save(notification);
        return notificationMapper.toNotificationResponse(notification);
    }

    public void createNotificationForUser(String userId, String type, String message) {
        NotificationCreationRequest request = NotificationCreationRequest.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .build();

        createNotification(request);
    }
}

