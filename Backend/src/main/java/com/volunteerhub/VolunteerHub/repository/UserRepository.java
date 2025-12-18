package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findUserById (String id);
    Optional<User> findUserByEmail (String email);
    Boolean existsByEmail (String email);


    long countByRolesContains(String role);

    // Đếm user đang hoạt động
    long countByIsActiveTrue(); // Lưu ý tên field là is_active hay isActive trong Entity
}

