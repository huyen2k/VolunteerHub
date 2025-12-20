package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    String id;
    String channelId;
    String authorId;
    String authorName;
    String authorAvatar;
    String title;
    String category;
    java.util.List<String> tags;
    String content;
    List<String> images;
    Long likesCount;
    Long commentsCount;
    Long views;
    Boolean isLiked;
    String eventId;

    @CreatedDate
    Date createdAt;

    @LastModifiedDate
    Date updatedAt;
}