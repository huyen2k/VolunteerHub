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
import com.volunteerhub.VolunteerHub.repository.*;
import com.volunteerhub.VolunteerHub.dto.response.UserStatsResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    UserRepository userRepository;
    EventRegistrationRepository eventRegistrationRepository;
    PostRepository postRepository;
    CommentRepository commentRepository;
    LikeRepository likeRepository;

    UserMapper userMapper;
    PasswordEncoder passwordEncoder;


    // Lấy danh sách user có phân trang (Cho Admin Table)
    public Page<UserResponse> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("full_name").ascending().and(Sort.by("id").ascending()));

        return userRepository.findAll(pageable)
                .map(userMapper::toUserResponse);
    }

    // Tìm kiếm user (Cho thanh Search Admin)
    public Page<UserResponse> searchUsers(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by("full_name").ascending().and(Sort.by("id").ascending()));

        return userRepository.searchUsers(keyword, pageable)
                .map(userMapper::toUserResponse);
    }

    // Giữ lại hàm cũ cho các logic nội bộ khác (nếu cần), nhưng hạn chế dùng
    public List<UserResponse> getAllUsersNoPaging() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    public UserResponse getUserById(String id){
        User user = userRepository.findUserById(id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }


    public UserResponse createUser(UserCreationRequest request){
        if(Boolean.TRUE.equals(userRepository.existsByEmail(request.getEmail())))
            throw new AppException(ErrorCode.USER_EXISTED);

        User user = userMapper.toUser(request);
        // Sử dụng Bean PasswordEncoder đã Inject, không new thủ công
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setIsActive(true);

        HashSet<String> roles = new HashSet<>();
        if (request.getRole() != null && "manager".equalsIgnoreCase(request.getRole())) {
            roles.add(Roles.EVEN_MANAGER.name());
        } else {
            roles.add(Roles.VOLUNTEER.name());
        }
        user.setRoles(roles);

        userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateMyInfo(UserUpdateRequest request) {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getFull_name() != null) user.setFull_name(request.getFull_name());
        if (request.getAvatar_url() != null) user.setAvatar_url(request.getAvatar_url());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getBio() != null) user.setBio(request.getBio());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if(request.getIsActive() != null) user.setIsActive(request.getIsActive());

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserStatus(String id, UserStatusRequest request){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        } else {
            log.warn("Warning: 'active' field is null in payload.");
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(String id){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getRoles() != null && user.getRoles().contains(Roles.ADMIN.name())) {
            throw new RuntimeException("Không thể xóa tài khoản Quản trị viên!");
        }
        userRepository.deleteById(id);
    }


    public UserStatsResponse getUserStats(String userId) {

        long totalEventsRegistered = 0;
        long completedEvents = 0;
        long pendingEvents = 0;
        long approvedEvents = 0;

        try {
            var registrations = eventRegistrationRepository.findByUserId(userId);
            if (registrations != null) {
                totalEventsRegistered = registrations.size();
                completedEvents = registrations.stream().filter(r -> "completed".equals(r.getStatus())).count();
                pendingEvents = registrations.stream().filter(r -> "pending".equals(r.getStatus())).count();
                approvedEvents = registrations.stream().filter(r -> "approved".equals(r.getStatus())).count();
            }
        } catch (Exception ignored) {}

        long totalPosts = 0;
        try {
            // PostRepository chưa có countByAuthorId trong bản update trước, nên dùng tạm findByAuthorId
            var posts = postRepository.findByAuthorId(userId);
            if(posts != null) totalPosts = posts.size();
        } catch(Exception ignored){}

        long totalComments = 0;
        try {
            var cmts = commentRepository.findByAuthorId(userId);
            if(cmts != null) totalComments = cmts.size();
        } catch(Exception ignored){}

        long totalLikes = 0;
        try {
            var likes = likeRepository.findByUserId(userId);
            if(likes != null) totalLikes = likes.size();
        } catch(Exception ignored){}

        return UserStatsResponse.builder()
                .totalEventsRegistered(totalEventsRegistered)
                .completedEvents(completedEvents)
                .pendingEvents(pendingEvents)
                .approvedEvents(approvedEvents)
                .totalPosts(totalPosts)
                .totalComments(totalComments)
                .totalLikes(totalLikes)
                .build();
    }
}