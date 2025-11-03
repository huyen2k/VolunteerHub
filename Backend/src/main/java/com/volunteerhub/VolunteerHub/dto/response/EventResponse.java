package com.volunteerhub.VolunteerHub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {
    String title;
    String  description;
    Date date;
    String location;
}
