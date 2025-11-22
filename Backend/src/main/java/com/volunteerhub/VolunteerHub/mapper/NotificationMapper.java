package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.dto.request.Notification.NotificationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.response.NotificationResponse;
import com.volunteerhub.VolunteerHub.collection.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isRead", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Notification toNotification(NotificationCreationRequest request);
    
    NotificationResponse toNotificationResponse(Notification notification);
}

