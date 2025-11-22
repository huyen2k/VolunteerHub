package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Post;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.PostResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.PostMapper;
import com.volunteerhub.VolunteerHub.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {
    @Autowired
    PostRepository postRepository;

    @Autowired
    PostMapper postMapper;

    @Autowired
    com.volunteerhub.VolunteerHub.repository.LikeRepository likeRepository;

    @Autowired
    com.volunteerhub.VolunteerHub.repository.CommentRepository commentRepository;

    @Autowired
    com.volunteerhub.VolunteerHub.service.UserService userService;

    public PostResponse createPost(PostCreationRequest request){
        Post post = postMapper.toPost(request);

        if(post.getLikesCount() == null) {
            post.setLikesCount(0L);
        }
        if(post.getCommentsCount() == null) {
            post.setCommentsCount(0L);
        }
        if(post.getImages() == null) {
            post.setImages(List.of());
        }

        try {
            var author = userService.getUserById(post.getAuthorId());
            post.setAuthorName(author.getFull_name());
            post.setAuthorAvatar(author.getAvatar_url());
        } catch (Exception ignored) {}

        postRepository.save(post);

        var res = postMapper.toPostResponse(post);
        try {
            String pid = post.getId();
            res.setLikesCount(likeRepository.countByTargetTypeAndTargetId("post", pid));
            res.setCommentsCount(commentRepository.countByPostId(pid));
            var current = userService.getMyInfo();
            res.setIsLiked(likeRepository.existsByUserIdAndTargetTypeAndTargetId(current.getId(), "post", pid));
        } catch (Exception ignored) {}
        return res;
    }

    public PostResponse updatePost(String postId, PostUpdateRequest request){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        postMapper.updatePost(post, request);
        try {
            if (post.getAuthorId() != null) {
                var author = userService.getUserById(post.getAuthorId());
                post.setAuthorName(author.getFull_name());
                post.setAuthorAvatar(author.getAvatar_url());
            }
        } catch (Exception ignored) {}
        postRepository.save(post);
        return postMapper.toPostResponse(post);
    }

    public PostResponse getPost(String postId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        try {
            if (post.getAuthorId() != null) {
                var author = userService.getUserById(post.getAuthorId());
                post.setAuthorName(author.getFull_name());
                post.setAuthorAvatar(author.getAvatar_url());
            }
        } catch (Exception ignored) {}
        return postMapper.toPostResponse(post);
    }

    public Post getPostEntity(String postId){
        return postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
    }

    public void deletePost(String postId){
        postRepository.deleteById(postId);
    }

    public List<PostResponse> getPostsByChannelId(String channelId){
        return postRepository.findByChannelId(channelId)
                .stream()
                .map(p -> {
                    var res = postMapper.toPostResponse(p);
                    try {
                        if (p.getAuthorId() != null) {
                            var a = userService.getUserById(p.getAuthorId());
                            res.setAuthorName(a.getFull_name());
                            res.setAuthorAvatar(a.getAvatar_url());
                        }
                        res.setLikesCount(likeRepository.countByTargetTypeAndTargetId("post", p.getId()));
                        res.setCommentsCount(commentRepository.countByPostId(p.getId()));
                        var current = userService.getMyInfo();
                        res.setIsLiked(likeRepository.existsByUserIdAndTargetTypeAndTargetId(current.getId(), "post", p.getId()));
                    } catch (Exception ignored) {}
                    return res;
                })
                .toList();
    }

    public List<PostResponse> getPostsByAuthorId(String authorId){
        return postRepository.findByAuthorId(authorId)
                .stream()
                .map(p -> {
                    var res = postMapper.toPostResponse(p);
                    try {
                        if (p.getAuthorId() != null) {
                            var a = userService.getUserById(p.getAuthorId());
                            res.setAuthorName(a.getFull_name());
                            res.setAuthorAvatar(a.getAvatar_url());
                        }
                        res.setLikesCount(likeRepository.countByTargetTypeAndTargetId("post", p.getId()));
                        res.setCommentsCount(commentRepository.countByPostId(p.getId()));
                        var current = userService.getMyInfo();
                        res.setIsLiked(likeRepository.existsByUserIdAndTargetTypeAndTargetId(current.getId(), "post", p.getId()));
                    } catch (Exception ignored) {}
                    return res;
                })
                .toList();
    }

    public long getPostCountByChannelId(String channelId) {
        return postRepository.countByChannelId(channelId);
    }
}