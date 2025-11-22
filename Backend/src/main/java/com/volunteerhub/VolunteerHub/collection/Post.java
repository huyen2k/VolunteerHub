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
    String authorName;
    String authorAvatar;

    String title;
    String content;
    String category;
    List<String> tags;    

    List<String> images;

    Long likesCount;
    Long commentsCount;
    Long views;            

    // Thời gian
    @CreatedDate
    Date createdAt;

    @LastModifiedDate
    Date updatedAt;
}
