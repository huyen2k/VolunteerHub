package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Post.PostCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.PostResponse;
import com.volunteerhub.VolunteerHub.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PostController {
    @Autowired
    PostService postService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_POST')")
    ApiResponse<PostResponse> createPost(@RequestBody PostCreationRequest request){
        return ApiResponse.<PostResponse>builder()
                .result(postService.createPost(request))
                .build();
    }

    @PutMapping("/{postId}")
    @PreAuthorize("hasAuthority('UPDATE_POST')")
    ApiResponse<PostResponse> updatePost(@PathVariable String postId, @RequestBody PostUpdateRequest request){
        return ApiResponse.<PostResponse>builder()
                .result(postService.updatePost(postId, request))
                .build();
    }

    @GetMapping("/{postId}")
    @PreAuthorize("hasAuthority('READ_POST')")
    ApiResponse<PostResponse> getPost(@PathVariable String postId){
        return ApiResponse.<PostResponse>builder()
                .result(postService.getPost(postId))
                .build();
    }

    @DeleteMapping("/{postId}")
    @PreAuthorize("hasAuthority('DELETE_POST')")
    ApiResponse<Void> deletePost(@PathVariable String postId){
        postService.deletePost(postId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/channel/{channelId}")
    @PreAuthorize("hasAuthority('READ_POST')")
    ApiResponse<List<PostResponse>> getPostsByChannel(@PathVariable String channelId){
        return ApiResponse.<List<PostResponse>>builder()
                .result(postService.getPostsByChannelId(channelId))
                .build();
    }

    @GetMapping("/author/{authorId}")
    @PreAuthorize("hasAuthority('READ_POST')")
    ApiResponse<List<PostResponse>> getPostsByAuthor(@PathVariable String authorId){
        return ApiResponse.<List<PostResponse>>builder()
                .result(postService.getPostsByAuthorId(authorId))
                .build();
    }
}