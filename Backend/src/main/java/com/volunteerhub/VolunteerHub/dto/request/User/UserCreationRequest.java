package com.volunteerhub.VolunteerHub.dto.request.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreationRequest {
    private String email;
    private String password;
    private String full_name;
    private String avatar_url;
    private String phone;
    private String address;
    private String bio;
}
