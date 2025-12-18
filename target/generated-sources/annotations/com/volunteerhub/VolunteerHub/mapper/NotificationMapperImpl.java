package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Notification;
import com.volunteerhub.VolunteerHub.dto.request.Notification.NotificationCreationRequest;
import com.volunteerhub.VolunteerHub.dto.response.NotificationResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-18T22:19:12+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public Notification toNotification(NotificationCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Notification.NotificationBuilder notification = Notification.builder();

        notification.userId( request.getUserId() );
        notification.type( request.getType() );
        notification.message( request.getMessage() );

        return notification.build();
    }

    @Override
    public NotificationResponse toNotificationResponse(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationResponse.NotificationResponseBuilder notificationResponse = NotificationResponse.builder();

        notificationResponse.id( notification.getId() );
        notificationResponse.userId( notification.getUserId() );
        notificationResponse.type( notification.getType() );
        notificationResponse.message( notification.getMessage() );
        notificationResponse.isRead( notification.getIsRead() );
        notificationResponse.createdAt( notification.getCreatedAt() );

        return notificationResponse.build();
    }
}
