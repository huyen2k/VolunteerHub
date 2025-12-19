package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.User.UserCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserStatusRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.dto.response.UserStatsResponse;
import com.volunteerhub.VolunteerHub.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {

    UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_LIST') or hasRole('ADMIN')")
    ApiResponse<List<UserResponse>> getAllUsers(){
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getUsers())
                .build();
    }

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody @Validated UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    // --- CẶP API CHO CÁ NHÂN (PROFILE) ---

    @GetMapping("/my-profile")
    ApiResponse<UserResponse> getMyProfile(){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }


    @PutMapping("/my-profile")
    ApiResponse<UserResponse> updateMyProfile(@RequestBody UserUpdateRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateMyInfo(request))
                .build();
    }

    // --- CÁC API QUẢN TRỊ (ADMIN) ---

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVEN_MANAGER', 'VOLUNTEER')")
    ApiResponse<UserResponse> getUserById(@PathVariable String id){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(id))
                .build();
    }

    // Admin cập nhật user bất kỳ (Khóa, đổi role...)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<UserResponse> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(id, request))
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<UserResponse> updateUserStatus(@PathVariable String id, @RequestBody UserStatusRequest request){
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUserStatus(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DELETE_USER') or hasRole('ADMIN')")
    ApiResponse<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{id}/stats")
    ApiResponse<UserStatsResponse> getUserStats(@PathVariable String id) {
        return ApiResponse.<UserStatsResponse>builder()
                .result(userService.getUserStats(id))
                .build();
    }
}