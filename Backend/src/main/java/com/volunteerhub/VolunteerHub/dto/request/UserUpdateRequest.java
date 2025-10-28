package com.volunteerhub.VolunteerHub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

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
    private Boolean is_active;

    @CreatedDate
    private Date created_at;

    @LastModifiedDate
    private Date updated_at;

    private Date last_login;
}
