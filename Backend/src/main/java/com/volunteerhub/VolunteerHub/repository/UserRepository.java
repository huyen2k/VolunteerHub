package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findUserById (String id);
    Optional<User> findUserByEmail (String email);
    Boolean existsByEmail (String email);

    long countByRolesContains(String role);
    // Đếm user đang hoạt động
    long countByIsActive(boolean isActive);;

    Page<User> findAll(Pageable pageable);

    // Tìm kiếm User theo tên hoặc email (Search Bar)
    @Query("{ $or: [ { 'full_name': { $regex: ?0, $options: 'i' } }, { 'email': { $regex: ?0, $options: 'i' } } ] }")
    Page<User> searchUsers(String keyword, Pageable pageable);

    @Query(value = "{ 'roles': ?0 }", count = true)
    long countByRole(String roleName);
}

