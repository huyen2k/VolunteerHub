package com.volunteerhub.VolunteerHub.dto.request.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    // Các trường người dùng được phép sửa
    private String full_name;
    private String avatar_url;
    private String phone;
    private String address;
    private String bio;

    // Các trường nhạy cảm
    private String password;
    private String email;
    private String role;
    private Boolean isActive;
}