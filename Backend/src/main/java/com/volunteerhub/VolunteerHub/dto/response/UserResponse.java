package com.volunteerhub.VolunteerHub.dto.response;

import java.util.Date;
import java.util.Set;

import com.volunteerhub.VolunteerHub.collection.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String email;
    Set<String> roles;

    String full_name;
    String avatar_url;
    String phone;
    String address;
    String bio;

    Boolean is_active;

    @CreatedDate
    Date created_at;

    @LastModifiedDate
    Date updated_at;
}
