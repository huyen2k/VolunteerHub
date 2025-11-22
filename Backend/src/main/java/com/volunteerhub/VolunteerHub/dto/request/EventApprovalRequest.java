package com.volunteerhub.VolunteerHub.dto.request;

import lombok.Data;

@Data
public class EventApprovalRequest {
    private String status;
    private String reason;
}
