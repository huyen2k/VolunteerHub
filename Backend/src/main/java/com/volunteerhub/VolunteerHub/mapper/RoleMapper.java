package com.volunteerhub.VolunteerHub.mapper;


import com.volunteerhub.VolunteerHub.collection.Role;
import com.volunteerhub.VolunteerHub.dto.request.RoleRequest;
import com.volunteerhub.VolunteerHub.dto.response.RoleResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
