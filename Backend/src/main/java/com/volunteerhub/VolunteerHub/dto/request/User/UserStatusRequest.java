package com.volunteerhub.VolunteerHub.dto.request.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusRequest {
    private String email;
    Set<String> roles;
    Boolean is_active;
}
