package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {
    List<Like> findByUserId(String userId);
    List<Like> findByTargetTypeAndTargetId(String targetType, String targetId);
    boolean existsByUserIdAndTargetTypeAndTargetId(String userId, String targetType, String targetId);
    long countByTargetTypeAndTargetId(String targetType, String targetId);
    void deleteByUserIdAndTargetTypeAndTargetId(String userId, String targetType, String targetId);
}