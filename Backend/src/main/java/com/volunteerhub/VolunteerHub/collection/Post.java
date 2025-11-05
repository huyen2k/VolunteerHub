package com.volunteerhub.VolunteerHub.collection;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "posts")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Post {
    @Id
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
