package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.dto.request.UserCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.UserUpdateRequest;
import com.volunteerhub.VolunteerHub.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-10-31T16:35:23+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toUser(UserCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        User user = new User();

        user.setEmail( request.getEmail() );
        user.setPassword( request.getPassword() );
        user.setRole( request.getRole() );
        user.setFull_name( request.getFull_name() );
        user.setAvatar_url( request.getAvatar_url() );
        user.setPhone( request.getPhone() );
        user.setAddress( request.getAddress() );
        user.setBio( request.getBio() );
        user.setIs_active( request.getIs_active() );
        user.setLast_login( request.getLast_login() );

        return user;
    }

    @Override
    public void updateUser(User user, UserUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        user.setEmail( request.getEmail() );
        user.setPassword( request.getPassword() );
        user.setRole( request.getRole() );
        user.setFull_name( request.getFull_name() );
        user.setAvatar_url( request.getAvatar_url() );
        user.setPhone( request.getPhone() );
        user.setAddress( request.getAddress() );
        user.setBio( request.getBio() );
        user.setIs_active( request.getIs_active() );
        user.setCreated_at( request.getCreated_at() );
        user.setUpdated_at( request.getUpdated_at() );
        user.setLast_login( request.getLast_login() );
    }
}
