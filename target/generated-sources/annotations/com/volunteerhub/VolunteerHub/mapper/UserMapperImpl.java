package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.User;
import com.volunteerhub.VolunteerHub.dto.request.User.UserCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserStatusRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-10T20:20:37+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toUser(UserCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.email( request.getEmail() );
        user.password( request.getPassword() );
        user.full_name( request.getFull_name() );
        user.avatar_url( request.getAvatar_url() );
        user.phone( request.getPhone() );
        user.address( request.getAddress() );
        user.bio( request.getBio() );

        return user.build();
    }

    @Override
    public void updateUser(User user, UserUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        user.setEmail( request.getEmail() );
        user.setPassword( request.getPassword() );
        user.setFull_name( request.getFull_name() );
        user.setAvatar_url( request.getAvatar_url() );
        user.setPhone( request.getPhone() );
        user.setAddress( request.getAddress() );
        user.setBio( request.getBio() );
        user.setIsActive( request.getIsActive() );
    }

    @Override
    public void updateStatus(User user, UserStatusRequest request) {
        if ( request == null ) {
            return;
        }

        user.setIsActive( request.getIsActive() );
    }

    @Override
    public UserResponse toUserResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse.UserResponseBuilder userResponse = UserResponse.builder();

        userResponse.id( user.getId() );
        userResponse.email( user.getEmail() );
        Set<String> set = user.getRoles();
        if ( set != null ) {
            userResponse.roles( new LinkedHashSet<String>( set ) );
        }
        userResponse.full_name( user.getFull_name() );
        userResponse.avatar_url( user.getAvatar_url() );
        userResponse.phone( user.getPhone() );
        userResponse.address( user.getAddress() );
        userResponse.bio( user.getBio() );
        userResponse.isActive( user.getIsActive() );
        userResponse.created_at( user.getCreated_at() );
        userResponse.updated_at( user.getUpdated_at() );

        return userResponse.build();
    }
}
