package com.volunteerhub.VolunteerHub.collection;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;


import java.util.Date;

@Document(collection = "events")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Event {
    @Id
    String id;

    String title;
    String  description;
    Date date;
    String location;
    String status; // 'pending', 'approved', 'rejected', 'completed'

    String approvedBy; // Ref -> users (role: admin)
    Date approvedAt;

    @CreatedBy
    String createdBy; // Ref -> users (role: event_manager)

    @CreatedDate
    Date createdAt;

    @LastModifiedDate
    Date updatedAt;
}
