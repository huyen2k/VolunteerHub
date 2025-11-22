package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Post.PostCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.PostResponse;
import com.volunteerhub.VolunteerHub.service.PostService;
import com.volunteerhub.VolunteerHub.service.UserService;
import com.volunteerhub.VolunteerHub.service.CommentService;
import com.volunteerhub.VolunteerHub.service.LikeService;
import com.volunteerhub.VolunteerHub.repository.LikeRepository;
import com.volunteerhub.VolunteerHub.dto.response.CommentResponse;
import com.volunteerhub.VolunteerHub.dto.response.LikeResponse;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentUpdateRequest;
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

    @Autowired
    CommentService commentService;

    @Autowired
    LikeService likeService;

    @Autowired
    LikeRepository likeRepository;

    @Autowired
    UserService userService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_POST')")
    ApiResponse<PostResponse> createPost(@RequestBody PostCreationRequest request){
        String userId = userService.getMyInfo().getId();
        request.setAuthorId(userId);
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
    ApiResponse<Void> deletePost(@PathVariable String postId){
        String currentUserId = userService.getMyInfo().getId();
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        com.volunteerhub.VolunteerHub.collection.Post post = postService.getPostEntity(postId);
        boolean isOwner = post.getAuthorId() != null && post.getAuthorId().equals(currentUserId);

        if (isOwner || isAdmin) {
            postService.deletePost(postId);
            return ApiResponse.<Void>builder().build();
        }
        throw new com.volunteerhub.VolunteerHub.exception.AppException(com.volunteerhub.VolunteerHub.exception.ErrorCode.UNAUTHORIZED);
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

    @PostMapping("/{postId}/like")
    @PreAuthorize("hasAuthority('CREATE_LIKE')")
    ApiResponse<LikeResponse> likePost(@PathVariable String postId){
        String userId = userService.getMyInfo().getId();
        var req = com.volunteerhub.VolunteerHub.dto.request.Like.LikeCreationRequest.builder()
                .userId(userId)
                .targetType("post")
                .targetId(postId)
                .build();
        var res = likeService.createLike(req);
        return ApiResponse.<LikeResponse>builder()
                .result(res)
                .build();
    }

    @DeleteMapping("/{postId}/like")
    @PreAuthorize("hasAnyAuthority('READ_LIKE','CREATE_LIKE','DELETE_LIKE')")
    ApiResponse<Void> unlikePost(@PathVariable String postId){
        String userId = userService.getMyInfo().getId();
        likeRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, "post", postId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/{postId}/comments")
    @PreAuthorize("hasAuthority('READ_COMMENT')")
    ApiResponse<List<CommentResponse>> getPostComments(@PathVariable String postId){
        return ApiResponse.<List<CommentResponse>>builder()
                .result(commentService.getCommentsByPostId(postId))
                .build();
    }

    @PostMapping("/{postId}/comments")
    @PreAuthorize("hasAuthority('CREATE_COMMENT')")
    ApiResponse<CommentResponse> createPostComment(@PathVariable String postId, @RequestBody CommentUpdateRequest body){
        String userId = userService.getMyInfo().getId();
        var req = com.volunteerhub.VolunteerHub.dto.request.Comment.CommentCreationRequest.builder()
                .postId(postId)
                .authorId(userId)
                .content(body.getContent())
                .build();
        var res = commentService.createComment(req);
        return ApiResponse.<CommentResponse>builder()
                .result(res)
                .build();
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    @PreAuthorize("hasAuthority('DELETE_COMMENT')")
    ApiResponse<Void> deletePostComment(@PathVariable String postId, @PathVariable String commentId){
        commentService.deleteComment(commentId);
        return ApiResponse.<Void>builder()
                .build();
    }
}