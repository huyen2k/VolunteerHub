package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Event.EventApprovalRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Event.EventUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.AdminDashboardResponse;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.DashboardStatsResponse;
import com.volunteerhub.VolunteerHub.dto.response.EventResponse;
import com.volunteerhub.VolunteerHub.service.EventService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventController {

    EventService eventService;

    // ==========================================
    // 1. API QUAN TRỌNG NHẤT (SEARCH & PAGINATION)
    // ==========================================

    @GetMapping
    public ApiResponse<Page<EventResponse>> getAllEvents(
            @RequestParam(required = false, defaultValue = "") String keyword, // Thêm tham số tìm kiếm
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Tự động kiểm tra xem người gọi API có phải là Admin/Manager không
        boolean isAdmin = false;
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                                || a.getAuthority().equals("ROLE_EVEN_MANAGER")
                                || a.getAuthority().equals("SCOPE_ADMIN") // Đề phòng dùng JWT Scope
                                || a.getAuthority().equals("SCOPE_EVEN_MANAGER"));
            }
        } catch (Exception ignored) {}

        // Gọi hàm Service mới (đã hỗ trợ search + phân quyền view)
        return ApiResponse.<Page<EventResponse>>builder()
                .result(eventService.getEvents(keyword, page, size, isAdmin))
                .build();
    }

    // ==========================================
    // 2. CÁC API THỐNG KÊ (DASHBOARD)
    // ==========================================

    @GetMapping("/admin/dashboard-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AdminDashboardResponse> getAdminDashboardStats() {
        return ApiResponse.<AdminDashboardResponse>builder()
                .result(eventService.getAdminDashboardStats())
                .build();
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<EventResponse>> getPendingEvents() {
        return ApiResponse.<List<EventResponse>>builder()
                .result(eventService.getPendingEvents())
                .build();
    }

    @GetMapping("/admin/top-attractive")
//    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<EventResponse>> getTopAttractiveEvents() {
        return ApiResponse.<List<EventResponse>>builder()
                .result(eventService.getTopAttractiveEvents())
                .build();
    }

    @GetMapping("/manager/dashboard-stats")
    @PreAuthorize("hasRole('EVEN_MANAGER')")
    public ApiResponse<DashboardStatsResponse> getManagerDashboardStats() {
        return ApiResponse.<DashboardStatsResponse>builder()
                .result(eventService.getManagerDashboardStats())
                .build();
    }

    @GetMapping("/dashboard-stats")
    public ApiResponse<DashboardStatsResponse> getDashboardStats() {
        return ApiResponse.<DashboardStatsResponse>builder()
                .result(eventService.getDashboardStats())
                .build();
    }

    @GetMapping("/top-new")
    public ApiResponse<List<EventResponse>> getTopNewEvents() {
        return ApiResponse.<List<EventResponse>>builder()
                .result(eventService.getTopNewEvents())
                .build();
    }

    // ==========================================
    // 3. API CRUD KHÁC (GIỮ NGUYÊN)
    // ==========================================

    // API này có thể giữ lại để backup, nhưng Frontend AdminEventsPage giờ đã dùng API "/" ở trên rồi
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<EventResponse>> getAllEventsForAdmin() {
        return ApiResponse.<List<EventResponse>>builder()
                .result(eventService.getEventsForAdmin())
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('EVEN_MANAGER') or hasAuthority('CREATE_EVENT')")
    public ApiResponse<EventResponse> createEvent(@RequestBody EventCreationRequest eventCreationRequest) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.createEvent(eventCreationRequest))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<EventResponse> getEvent(@PathVariable String id) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.getEventById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_EVENT')")
    public ApiResponse<EventResponse> updateEvent(@PathVariable String id, @RequestBody EventUpdateRequest eventUpdateRequest) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.updateEvent(id, eventUpdateRequest))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_EVENT')")
    public ApiResponse<Void> deleteEvent(@PathVariable String id) {
        eventService.deleteEvent(id);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('APPROVE_EVENT')")
    public ApiResponse<EventResponse> approveEvent(@PathVariable String id,
                                                   @RequestBody EventApprovalRequest eventApprovalRequest) {
        return ApiResponse.<EventResponse>builder()
                .result(eventService.approveEvent(id, eventApprovalRequest))
                .build();
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('APPROVE_EVENT')")
    public ApiResponse<EventResponse> rejectEvent(@PathVariable String id,
                                                  @RequestBody EventApprovalRequest eventApprovalRequest) {
        eventApprovalRequest.setStatus("rejected");
        return ApiResponse.<EventResponse>builder()
                .result(eventService.approveEvent(id, eventApprovalRequest))
                .build();
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('EVEN_MANAGER')")
    public ApiResponse<List<EventResponse>> getMyEvents() {
        return ApiResponse.<List<EventResponse>>builder()
                .result(eventService.getMyEvents())
                .build();
    }

    @PostMapping(value = "/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('EVEN_MANAGER') or hasRole('ADMIN')")
    public ApiResponse<String> uploadEventImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        String imageUrl = eventService.uploadEventImage(id, file);
        return ApiResponse.<String>builder()
                .result(imageUrl)
                .build();
    }
}