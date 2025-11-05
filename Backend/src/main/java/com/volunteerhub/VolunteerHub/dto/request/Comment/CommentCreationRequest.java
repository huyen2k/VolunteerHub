package com.volunteerhub.VolunteerHub.dto.request.Comment;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentCreationRequest {
    String postId;
    String authorId;
    String content;
}