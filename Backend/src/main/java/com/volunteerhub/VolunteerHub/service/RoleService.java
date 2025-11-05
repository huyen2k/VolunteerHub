package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Role;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.RoleResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.RoleMapper;
import com.volunteerhub.VolunteerHub.repository.PermissionRepository;
import com.volunteerhub.VolunteerHub.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;

    public RoleResponse create(RoleCreationRequest request){
        if (roleRepository.existsById(request.getName())){
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        var role = roleMapper.toRole(request);
        var permissions = request.getPermissions();
        role.setPermissions(new HashSet<>(permissions));
        roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    public List<RoleResponse> getAll(){
        var roles = roleRepository.findAll();
        return roles.stream()
                .map(roleMapper::toRoleResponse)
                .toList();
    }

    public RoleResponse updatePermission(String role, RoleUpdateRequest request){
        Role roleName = roleRepository.findByName(role)
                        .orElseThrow(()-> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        var permissions = request.getPermissions();
        roleName.getPermissions().addAll(permissions);
        return roleMapper.toRoleResponse(roleRepository.save(roleName));
    }

    public void delete(String role){
        roleRepository.deleteById(role);
    }
}
