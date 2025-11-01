package com.volunteerhub.VolunteerHub.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Slf4j
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        log.warn("Authentication failed: {}", authException == null ? "-" : authException.getMessage());

        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(ErrorCode.UNAUTHENTICATED.getCode())
                .message(ErrorCode.UNAUTHENTICATED.getMessage())
                .build();

        response.setStatus(ErrorCode.UNAUTHENTICATED.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        // write to output stream to avoid partial/empty body issues in some servlet containers
        objectMapper.writeValue(response.getOutputStream(), apiResponse);
        try {
            response.getOutputStream().flush();
        } catch (Exception e) {
            log.debug("Could not flush response output stream: {}", e.getMessage());
        }
    }
}
