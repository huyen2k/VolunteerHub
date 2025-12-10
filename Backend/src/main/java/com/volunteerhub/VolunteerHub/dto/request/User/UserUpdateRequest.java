package com.volunteerhub.VolunteerHub.dto.request.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String email;
    @Field("password_hash")
    private String password;
    private String role; //['volunteer', 'event_manager', 'admin']
    private String full_name;
    private String avatar_url;
    private String phone;
    private String address;
    private String bio;
    private Boolean isActive;
}
