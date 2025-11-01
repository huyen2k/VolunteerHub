package com.volunteerhub.VolunteerHub.mapper;


import com.volunteerhub.VolunteerHub.collection.Permission;
import com.volunteerhub.VolunteerHub.dto.request.PermissionRequest;
import com.volunteerhub.VolunteerHub.dto.response.PermissionResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
