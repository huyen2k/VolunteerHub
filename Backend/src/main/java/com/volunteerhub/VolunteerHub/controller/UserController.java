package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.User.UserCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserStatusRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.ChangePasswordRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserStatsResponse;
import com.volunteerhub.VolunteerHub.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_LIST') or hasRole('ADMIN')")
    public ApiResponse<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Nếu có từ khóa -> Gọi hàm tìm kiếm
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ApiResponse.<Page<UserResponse>>builder()
                    .result(userService.searchUsers(keyword, page, size))
                    .build();
        }

        // Nếu không -> Gọi hàm lấy danh sách phân trang
        return ApiResponse.<Page<UserResponse>>builder()
                .result(userService.getUsers(page, size))
                .build();
    }


    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody @Validated UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping("/my-profile")
    public ApiResponse<UserResponse> getMyProfile(){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @PutMapping("/my-profile")
    public ApiResponse<UserResponse> updateMyProfile(@RequestBody UserUpdateRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateMyInfo(request))
                .build();
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody @Validated ChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVEN_MANAGER', 'VOLUNTEER')")
    public ApiResponse<UserResponse> getUserById(@PathVariable String id){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(id))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(id, request))
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> updateUserStatus(@PathVariable String id, @RequestBody UserStatusRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUserStatus(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_USER') or hasRole('ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{id}/stats")
    public ApiResponse<UserStatsResponse> getUserStats(@PathVariable String id) {
        return ApiResponse.<UserStatsResponse>builder()
                .result(userService.getUserStats(id))
                .build();
    }
}