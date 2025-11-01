package com.volunteerhub.VolunteerHub.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Slf4j
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        log.warn("Access denied: {}", accessDeniedException == null ? "-" : accessDeniedException.getMessage());

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(ErrorCode.UNAUTHORIZED.getCode())
                .message(ErrorCode.UNAUTHORIZED.getMessage())
                .build();

        response.setStatus(ErrorCode.UNAUTHORIZED.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // write to output stream to avoid partial/empty body issues in some servlet containers
        objectMapper.writeValue(response.getOutputStream(), apiResponse);
    }
}

