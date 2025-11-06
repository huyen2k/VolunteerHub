package com.volunteerhub.VolunteerHub.mapper;


import com.volunteerhub.VolunteerHub.collection.Role;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.RoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleCreationRequest request);

    RoleResponse toRoleResponse(Role role);

    void updateRole(@MappingTarget Role role, RoleUpdateRequest request);
}
