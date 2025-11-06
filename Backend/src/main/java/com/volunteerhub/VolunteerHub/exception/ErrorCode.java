package com.volunteerhub.VolunteerHub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    CONFLICT(1009, "This object is already linked to another object", HttpStatus.CONFLICT),
    ROLE_EXISTED(1010, "Role existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1011, "Role not existed", HttpStatus.NOT_FOUND),
    REGISTRATION_EXISTED(1012, "Registration existed", HttpStatus.BAD_REQUEST),
    REGISTRATION_NOT_EXISTED(1013, "Registration not existed", HttpStatus.NOT_FOUND),
    CHANNEL_EXISTED(1014, "Registration existed", HttpStatus.BAD_REQUEST),
    CHANNEL_NOT_EXISTED(1015, "Registration not existed", HttpStatus.NOT_FOUND),
    POST_NOT_EXISTED(1016, "Registration not existed", HttpStatus.NOT_FOUND),
    COMMENT_NOT_EXISTED(1017, "Registration not existed", HttpStatus.NOT_FOUND),
    LIKE_NOT_EXISTED(1018, "Registration not existed", HttpStatus.NOT_FOUND),
    LIKE_EXISTS(1019, "Registration existed", HttpStatus.BAD_REQUEST),
    INVALID_TARGET_TYPE(1020, "Registration existed", HttpStatus.BAD_REQUEST)
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}