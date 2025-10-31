package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.dto.request.UserCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.UserUpdateRequest;
import com.volunteerhub.VolunteerHub.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
