package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    Page<Post> findByChannelId(String channelId, Pageable pageable);
    List<Post> findByAuthorId(String authorId);
    boolean existsByChannelIdAndAuthorId(String channelId, String authorId);
    long countByChannelId(String channelId);

    @Query(value = "{ 'createdAt': { $gte: ?0, $lte: ?1 } }", count = true)
    long countPostsBetween(Date start, Date end);

    @Query(value = "{}", sort = "{ 'likesCount': -1 }")
    List<Post> findTopHotPosts(Pageable pageable);

    @Query("{ $or: [ " +
            "   { 'content': { $regex: ?0, $options: 'i' } }, " +
            "   { 'authorName': { $regex: ?0, $options: 'i' } } " +
            "] }")
    Page<Post> searchByKeyword(String keyword, Pageable pageable);
}