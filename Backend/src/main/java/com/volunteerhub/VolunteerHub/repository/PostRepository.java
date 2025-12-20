package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
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

    @Aggregation(pipeline = {
            "{ '$addFields': { 'hotScore': { '$add': [ " +
                    "{ '$multiply': [ { '$ifNull': ['$likesCount', 0] }, 1 ] }, " +
                    "{ '$multiply': [ { '$ifNull': ['$commentsCount', 0] }, 2 ] } " +
                    "] } } }",
            "{ '$sort': { 'hotScore': -1, 'createdAt': -1 } }",
            "{ '$limit': 5 }"
    })
    List<Post> findTopHotPosts();

    @Query("{ $or: [ " +
            "   { 'content': { $regex: ?0, $options: 'i' } }, " +
            "   { 'authorName': { $regex: ?0, $options: 'i' } } " +
            "] }")
    Page<Post> searchByKeyword(String keyword, Pageable pageable);

    @Query(sort = "{ 'likesCount': -1, 'commentsCount': -1 }")
    List<Post> findTop5ByOrderByLikesCountDescCommentsCountDesc(Pageable pageable);
}