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
import com.volunteerhub.VolunteerHub.repository.EventRegistrationRepository;
import com.volunteerhub.VolunteerHub.repository.PostRepository;
import com.volunteerhub.VolunteerHub.repository.CommentRepository;
import com.volunteerhub.VolunteerHub.repository.LikeRepository;
import com.volunteerhub.VolunteerHub.dto.response.UserStatsResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private LikeRepository likeRepository;

    private UserMapper userMapper;

    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();
        User user = userRepository.findUserByEmail(email).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    public UserResponse getUserById(String id){
        User user = userRepository.findUserById(id).orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    public UserResponse createUser(UserCreationRequest request){
        if(userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.USER_EXISTED);

        User user = userMapper.toUser(request);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Set isActive chuẩn
        user.setIsActive(true);
//        user.setCreated_at(new Date());
//        user.setUpdated_at(new Date());

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

    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findUserById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.updateUser(user, request);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            PasswordEncoder enc = new BCryptPasswordEncoder(10);
            user.setPassword(enc.encode(request.getPassword()));
        }
//        user.setUpdated_at(new Date());
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUserStatus(String id, UserStatusRequest request){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // In log ra cả object request để xem nó nhận được gì
        log.info("Request update status payload: {}", request.toString());


        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        } else {
            log.warn("Warning: 'active' field is still null! Check Frontend JSON key.");
        }

        User savedUser = userRepository.save(user);
        log.info("User saved with status: {}", savedUser.getIsActive());

        return userMapper.toUserResponse(savedUser);
    }

    // Bảo vệ không cho xóa Admin
    public void deleteUser(String id){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kiểm tra nếu user có role ADMIN thì chặn lại
        if (user.getRoles() != null && user.getRoles().contains(Roles.ADMIN.name())) {
            throw new RuntimeException("Không thể xóa tài khoản Quản trị viên!");
        }

        userRepository.deleteById(id);
    }

    public UserStatsResponse getUserStats(String userId) {

        var registrations = eventRegistrationRepository.findByUserId(userId);
        long totalEventsRegistered = registrations.size();
        long completedEvents = registrations.stream().filter(r -> "completed".equals(r.getStatus())).count();
        long pendingEvents = registrations.stream().filter(r -> "pending".equals(r.getStatus())).count();
        long approvedEvents = registrations.stream().filter(r -> "approved".equals(r.getStatus())).count();

        long totalPosts = 0;
        try { var posts = postRepository.findByAuthorId(userId); if(posts != null) totalPosts = posts.size(); } catch(Exception ignored){}

        long totalComments = 0;
        try { var cmts = commentRepository.findByAuthorId(userId); if(cmts != null) totalComments = cmts.size(); } catch(Exception ignored){}

        long totalLikes = 0;
        try { var likes = likeRepository.findByUserId(userId); if(likes != null) totalLikes = likes.size(); } catch(Exception ignored){}

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