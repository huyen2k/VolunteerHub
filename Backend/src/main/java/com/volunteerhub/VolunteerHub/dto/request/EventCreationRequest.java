package com.volunteerhub.VolunteerHub.dto.request;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.util.Date;

public class EventCreationRequest {
    String title;
    String  description;
    Date date;
    String location;
}
