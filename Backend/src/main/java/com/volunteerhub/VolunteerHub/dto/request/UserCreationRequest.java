package com.volunteerhub.VolunteerHub.dto.request;

import lombok.*;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

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
