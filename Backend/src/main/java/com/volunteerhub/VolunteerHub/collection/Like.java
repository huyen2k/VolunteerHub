package com.volunteerhub.VolunteerHub.collection;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "likes")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Like {
    @Id
    String id;
    String userId;
    String targetType; // 'post' | 'comment'
    String targetId; // Ref -> posts hoặc comments

    @CreatedDate
    Date createdAt;

    @LastModifiedDate
    Date updatedAt;
}
