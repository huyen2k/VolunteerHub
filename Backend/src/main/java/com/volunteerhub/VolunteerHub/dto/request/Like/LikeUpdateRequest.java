package com.volunteerhub.VolunteerHub.dto.request.Like;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "likes")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LikeUpdateRequest {
    String targetType; // 'post' | 'comment'
    String targetId; // Ref -> posts hoặc comments
}