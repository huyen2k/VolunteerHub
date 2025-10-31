package com.volunteerhub.VolunteerHub.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AppException extends RuntimeException {
    private ErrorCode errorCode;
}
