package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.StatisticsResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.service.StatisticsService;
import com.volunteerhub.VolunteerHub.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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

        // Logic tự động xác định Manager ID nếu không truyền vào
        if (managerId == null) {
            try {
                UserResponse currentUser = userService.getMyInfo();
                // Nếu user hiện tại là Manager (và không phải Admin), thì chỉ xem stat của chính mình
                if (currentUser.getRoles() != null &&
                        currentUser.getRoles().contains("EVEN_MANAGER") &&
                        !currentUser.getRoles().contains("ADMIN")) {

                    managerId = currentUser.getId();
                }
                // Nếu là Admin mà không truyền param -> managerId = null -> Xem tất cả (Logic trong Service đã handle)
            } catch (Exception e) {
                log.warn("Could not determine current user for statistics: " + e.getMessage());
            }
        }

        return ApiResponse.<StatisticsResponse>builder()
                .result(statisticsService.getEventStatistics(managerId))
                .build();
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')") // Thường overview chỉ dành cho Admin
    public ApiResponse<StatisticsResponse> getOverviewStatistics() {
        return ApiResponse.<StatisticsResponse>builder()
                .result(statisticsService.getOverviewStatistics())
                .build();
    }
}