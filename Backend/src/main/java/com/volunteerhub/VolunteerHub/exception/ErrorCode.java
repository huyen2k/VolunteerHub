package com.volunteerhub.VolunteerHub.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    USER_LOCKED(1009, "Your account has been locked. Please contact the Administrator", HttpStatus.FORBIDDEN),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    CONFLICT(1009, "This object is already linked to another object", HttpStatus.CONFLICT),
    ROLE_EXISTED(1010, "Role existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1011, "Role not existed", HttpStatus.NOT_FOUND),
    REGISTRATION_EXISTED(1012, "Registration existed", HttpStatus.BAD_REQUEST),
    REGISTRATION_NOT_EXISTED(1013, "Registration not existed", HttpStatus.NOT_FOUND),
    CHANNEL_EXISTED(1014, "Channel existed", HttpStatus.BAD_REQUEST),
    CHANNEL_NOT_EXISTED(1015, "Channel not existed", HttpStatus.NOT_FOUND),
    POST_NOT_EXISTED(1016, "Post not existed", HttpStatus.NOT_FOUND),
    COMMENT_NOT_EXISTED(1017, "Comment not existed", HttpStatus.NOT_FOUND),
    LIKE_NOT_EXISTED(1018, "Like not existed", HttpStatus.NOT_FOUND),
    LIKE_EXISTS(1019, "Like existed", HttpStatus.BAD_REQUEST),
    INVALID_TARGET_TYPE(1020, "Invalid target type", HttpStatus.BAD_REQUEST),
    NOTIFICATION_NOT_EXISTED(1021, "Notification not existed", HttpStatus.NOT_FOUND),

    EVENT_NOT_EXISTED(1022, "Event not existed", HttpStatus.NOT_FOUND),
    EVENT_FULL(1023, "Event is full", HttpStatus.BAD_REQUEST),
    PASSWORD_INCORRECT(1024, "Password incorrect", HttpStatus.BAD_REQUEST)
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