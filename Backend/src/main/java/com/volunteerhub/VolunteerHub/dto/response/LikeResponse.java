package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LikeResponse {
    String id;
    String userId;
    String targetType; // 'post' | 'comment'
    String targetId; // Ref -> posts hoặc comments

    @CreatedDate
    Date createdAt;

    @LastModifiedDate
    Date updatedAt;
}