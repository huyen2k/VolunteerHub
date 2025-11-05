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
    String content;
    List<String> images;
    Number likesCount;
    Number commentsCount;

    @CreatedDate
    Date createdAt;

    @LastModifiedDate
    Date updatedAt;
}