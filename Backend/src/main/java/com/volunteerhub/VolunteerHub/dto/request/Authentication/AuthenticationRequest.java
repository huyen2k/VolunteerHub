package com.volunteerhub.VolunteerHub.dto.request.Authentication;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
        import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthenticationRequest {
    String email;
    String password;
}
