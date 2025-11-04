package com.volunteerhub.VolunteerHub.controller;

import com.nimbusds.jose.proc.SecurityContext;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.RoleResponse;
import com.volunteerhub.VolunteerHub.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleController {
    @Autowired
    RoleService roleService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_ROLE')")
    ApiResponse<RoleResponse> create(@RequestBody RoleCreationRequest request){
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.create(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_LIST')")
    ApiResponse<List<RoleResponse>> getAll(){
        return ApiResponse.<List<RoleResponse>>builder()
                .result(roleService.getAll())
                .build();
    }

    @PutMapping("/{role}")
    @PreAuthorize("hasAuthority('UPDATE_PERMISSION')")
    ApiResponse<RoleResponse> updatePermission(@PathVariable String role, @RequestBody RoleUpdateRequest request){
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.updatePermission(role, request))
                .build();
    }

    @DeleteMapping("/{role}")
    @PreAuthorize("hasAuthority('DELETE_ROLE')")
    ApiResponse<Void> delete(@PathVariable String role){
        roleService.delete(role);
        return ApiResponse.<Void>builder()
                .build();
    }
}
