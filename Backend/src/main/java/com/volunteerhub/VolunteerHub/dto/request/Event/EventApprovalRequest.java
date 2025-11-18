package com.volunteerhub.VolunteerHub.dto.request.Event;

import com.volunteerhub.VolunteerHub.enums.EventStatus;
import lombok.Data;

@Data
public class EventApprovalRequest {
    private EventStatus status;
    private String reason;
}
