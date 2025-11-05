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

    public PostResponse createPost(PostCreationRequest request){
        Post post = postMapper.toPost(request);

        // Set default values
        if(post.getLikesCount() == null) {
            post.setLikesCount(0);
        }
        if(post.getCommentsCount() == null) {
            post.setCommentsCount(0);
        }
        if(post.getImages() == null) {
            post.setImages(List.of());
        }

        postRepository.save(post);

        return postMapper.toPostResponse(post);
    }

    public PostResponse updatePost(String postId, PostUpdateRequest request){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        postMapper.updatePost(post, request);
        postRepository.save(post);
        return postMapper.toPostResponse(post);
    }

    public PostResponse getPost(String postId){
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_EXISTED));
        return postMapper.toPostResponse(post);
    }

    public void deletePost(String postId){
        postRepository.deleteById(postId);
    }

    public List<PostResponse> getPostsByChannelId(String channelId){
        return postRepository.findByChannelId(channelId)
                .stream()
                .map(postMapper::toPostResponse)
                .toList();
    }

    public List<PostResponse> getPostsByAuthorId(String authorId){
        return postRepository.findByAuthorId(authorId)
                .stream()
                .map(postMapper::toPostResponse)
                .toList();
    }

    public long getPostCountByChannelId(String channelId) {
        return postRepository.countByChannelId(channelId);
    }
}