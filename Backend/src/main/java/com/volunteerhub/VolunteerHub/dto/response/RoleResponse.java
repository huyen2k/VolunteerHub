package com.volunteerhub.VolunteerHub.dto.response;

import com.volunteerhub.VolunteerHub.collection.Permission;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    String name;
    String description;

    Set<String> permissions;
}
