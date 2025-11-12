package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.constant.Roles;
import com.volunteerhub.VolunteerHub.dto.request.User.UserCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserStatusRequest;
import com.volunteerhub.VolunteerHub.dto.request.User.UserUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.UserResponse;
import com.volunteerhub.VolunteerHub.collection.User;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.UserMapper;
import com.volunteerhub.VolunteerHub.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private UserMapper userMapper;

    private PasswordEncoder passwordEncoder;

    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        User user = userRepository.findUserByEmail(email).orElseThrow(
                ()-> new AppException(ErrorCode.USER_NOT_EXISTED)
        );

        return userMapper.toUserResponse(user);
    }

    public UserResponse getUserById(String id){
        User user = userRepository.findUserById(id).orElseThrow(
                ()-> new AppException(ErrorCode.USER_NOT_EXISTED)
        );
        return userMapper.toUserResponse(user);
    }

    public UserResponse createUser(UserCreationRequest request){
        if(userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.USER_EXISTED);
        User user = userMapper.toUser(request);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIs_active(true);
        user.setCreated_at(new Date());
        user.setUpdated_at(new Date());

        HashSet<String> roles = new HashSet<>();
        roles.add(Roles.VOLUNTEER.name());

        user.setRoles(roles);

        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findUserById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserStatus(String id, UserStatusRequest request){
        User user = userRepository.findUserById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateStatus(user, request);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(String id){
        userRepository.deleteById(id);
    }
}
