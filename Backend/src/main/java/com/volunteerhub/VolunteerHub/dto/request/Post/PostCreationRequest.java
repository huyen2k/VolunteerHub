package com.volunteerhub.VolunteerHub.dto.request.Post;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCreationRequest {
    String channelId;
    String authorId;
    String content;
    List<String> images;
}