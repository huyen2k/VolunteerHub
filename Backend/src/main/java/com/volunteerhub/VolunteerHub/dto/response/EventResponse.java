package com.volunteerhub.VolunteerHub.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventResponse {
    String id;
    String title;
    String description;
    Date date;
    String location;
    String status;
    String createdBy;
    String approvedBy;
    Date createdAt;
    Date updatedAt;
}
