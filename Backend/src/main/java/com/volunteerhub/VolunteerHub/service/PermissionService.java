package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Permission;
import com.volunteerhub.VolunteerHub.dto.request.PermissionRequest;
import com.volunteerhub.VolunteerHub.dto.response.PermissionResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.PermissionMapper;
import com.volunteerhub.VolunteerHub.repository.PermissionRepository;
import com.volunteerhub.VolunteerHub.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;
    RoleRepository roleRepository;

    public PermissionResponse create(PermissionRequest request){
        Permission permission = permissionMapper.toPermission(request);
        permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    public List<PermissionResponse> getAll(){
        var permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    public void delete(String permission){
        boolean inUse = roleRepository.existsByPermissionsContaining(permission);
        if (inUse) {
            throw new AppException(ErrorCode.CONFLICT);
        }
        permissionRepository.deleteByName(permission);
    }
}
