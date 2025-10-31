package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.dto.request.UserCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.UserUpdateRequest;
import com.volunteerhub.VolunteerHub.entity.User;
import com.volunteerhub.VolunteerHub.mapper.UserMapper;
import com.volunteerhub.VolunteerHub.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    public List<User> allUsers(){
        return userRepository.findAll();
    }

    public User createUser(UserCreationRequest request){
        User user = userMapper.toUser(request);

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIs_active(request.getIs_active() != null ? request.getIs_active() : true);
        user.setLast_login(null);
        user.setCreated_at(new Date());
        user.setUpdated_at(new Date());

        return userRepository.save(user);
    }

    public User updateUser(ObjectId id, UserUpdateRequest request){
        Optional<User> userOptional = getUser(id);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            userMapper.updateUser(user, request);

            return userRepository.save(user);
        } else {
            throw new java.util.NoSuchElementException("User not found with id: " + id);
        }}

    public Optional<User> getUser(ObjectId id){
        return userRepository.findUserById(id);
    }

    public void deleteUser(ObjectId id){
        userRepository.deleteById(id);
    }
}
