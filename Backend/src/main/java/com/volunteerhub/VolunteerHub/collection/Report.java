package com.volunteerhub.VolunteerHub.collection;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "reports")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Report {
    @Id
    String id;
    String type; // post, event, user, system
    String targetId;
    String authorId;
    String title;
    String description;
    String status; // pending, investigating, resolved, rejected
    @CreatedDate
    Date createdAt;
    @LastModifiedDate
    Date updatedAt;
}