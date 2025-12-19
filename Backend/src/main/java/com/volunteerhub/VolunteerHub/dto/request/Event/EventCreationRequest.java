package com.volunteerhub.VolunteerHub.dto.request.Event;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

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
    String category;
    String image;
    Integer volunteersNeeded;
}
