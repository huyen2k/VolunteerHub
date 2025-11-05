package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByChannelId(String channelId);
    List<Post> findByAuthorId(String authorId);
    boolean existsByChannelIdAndAuthorId(String channelId, String authorId);
    long countByChannelId(String channelId);
}