package com.volunteerhub.VolunteerHub.dto.request.Event;

import lombok.*;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventUpdateRequest {
    String title;
    String  description;
    Date date;
    String location;
    String category;
    String image;
    Integer volunteersNeeded;
}
