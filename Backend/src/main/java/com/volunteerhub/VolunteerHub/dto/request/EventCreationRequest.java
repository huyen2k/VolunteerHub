package com.volunteerhub.VolunteerHub.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventCreationRequest {
    String title;
    String  description;
    Date date;
    String location;
}
