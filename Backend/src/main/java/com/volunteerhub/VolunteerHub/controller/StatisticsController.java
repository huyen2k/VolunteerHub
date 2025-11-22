package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.StatisticsResponse;
import com.volunteerhub.VolunteerHub.service.StatisticsService;
import com.volunteerhub.VolunteerHub.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('USER_LIST') or hasRole('ADMIN')")
    public ApiResponse<StatisticsResponse> getUserStatistics() {
        return ApiResponse.<StatisticsResponse>builder()
                .result(statisticsService.getUserStatistics())
                .build();
    }

    @GetMapping("/events")
    @PreAuthorize("hasAnyAuthority('APPROVE_EVENT', 'UPDATE_EVENT', 'USER_LIST') or hasRole('EVEN_MANAGER') or hasRole('ADMIN')")
    public ApiResponse<StatisticsResponse> getEventStatistics(@RequestParam(required = false) String managerId) {
    
        if (managerId == null) {
            try {
                var currentUser = userService.getMyInfo();
                // Check if user is a manager
                if (currentUser.getRoles() != null && 
                    currentUser.getRoles().contains("EVEN_MANAGER")) {
                    managerId = currentUser.getId();
                }
            } catch (Exception e) {
                // bruh
            }
        }

        return ApiResponse.<StatisticsResponse>builder()
                .result(statisticsService.getEventStatistics(managerId))
                .build();
    }

    @GetMapping("/overview")
    public ApiResponse<StatisticsResponse> getOverviewStatistics() {
        return ApiResponse.<StatisticsResponse>builder()
                .result(statisticsService.getOverviewStatistics())
                .build();
    }
}

