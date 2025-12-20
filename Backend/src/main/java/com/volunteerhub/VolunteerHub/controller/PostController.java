package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.collection.Event; // QUAN TRỌNG: Import Event
import com.volunteerhub.VolunteerHub.collection.Post;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Post.PostUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.CommentResponse;
import com.volunteerhub.VolunteerHub.dto.response.LikeResponse;
import com.volunteerhub.VolunteerHub.dto.response.PostResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import com.volunteerhub.VolunteerHub.repository.LikeRepository;
import com.volunteerhub.VolunteerHub.service.CommentService;
import com.volunteerhub.VolunteerHub.service.LikeService;
import com.volunteerhub.VolunteerHub.service.PostService;
import com.volunteerhub.VolunteerHub.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PostController {

    PostService postService;
    CommentService commentService;
    LikeService likeService;
    LikeRepository likeRepository;
    UserService userService;

    ChannelRepository channelRepository;
    EventRepository eventRepository;

    @GetMapping("/channel/{channelId}")
    @PreAuthorize("hasAuthority('READ_POST')")
    public ApiResponse<Page<PostResponse>> getPostsByChannel(
            @PathVariable String channelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<PostResponse>>builder()
                .result(postService.getPostsByChannelId(channelId, page, size))
                .build();
    }

    @GetMapping("/author/{authorId}")
    @PreAuthorize("hasAuthority('READ_POST')")
    public ApiResponse<List<PostResponse>> getPostsByAuthor(@PathVariable String authorId){
        return ApiResponse.<List<PostResponse>>builder()
                .result(postService.getPostsByAuthorId(authorId))
                .build();
    }

    @GetMapping("/hot")
    public ApiResponse<List<PostResponse>> getHotPosts() {
        return ApiResponse.<List<PostResponse>>builder()
                .result(postService.getHotPosts())
                .build();
    }

    @GetMapping("/{postId}")
    @PreAuthorize("hasAuthority('READ_POST')")
    public ApiResponse<PostResponse> getPost(@PathVariable String postId){
        return ApiResponse.<PostResponse>builder()
                .result(postService.getPost(postId))
                .build();
    }


    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_POST')")
    public ApiResponse<PostResponse> createPost(@RequestBody PostCreationRequest request){
        String userId = userService.getMyInfo().getId();
        request.setAuthorId(userId);
        return ApiResponse.<PostResponse>builder()
                .result(postService.createPost(request))
                .build();
    }

    @PutMapping("/{postId}")
    @PreAuthorize("hasAuthority('UPDATE_POST')")
    public ApiResponse<PostResponse> updatePost(@PathVariable String postId, @RequestBody PostUpdateRequest request){
        return ApiResponse.<PostResponse>builder()
                .result(postService.updatePost(postId, request))
                .build();
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable String postId){
        String currentUserId = userService.getMyInfo().getId();
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        Post post = postService.getPostEntity(postId);
        boolean isOwner = post.getAuthorId() != null && post.getAuthorId().equals(currentUserId);

        // 1. Quyền xóa cơ bản: Admin hoặc Chính chủ
        if (isOwner || isAdmin) {
            postService.deletePost(postId);
            return ApiResponse.<Void>builder().build();
        }

        // 2. Quyền mở rộng: Manager được xóa bài trong Event mình quản lý
        try {
            if (post.getChannelId() != null) {
                Channel channel = channelRepository.findById(post.getChannelId()).orElse(null);
                if (channel != null && channel.getEventId() != null) {
                    Event event = eventRepository.findById(channel.getEventId()).orElse(null);

                    // SỬA TẠI ĐÂY: Dùng getCreatedBy() thay vì getOrganizerId()
                    if (event != null && currentUserId.equals(event.getCreatedBy())) {
                        postService.deletePost(postId);
                        return ApiResponse.<Void>builder().build();
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi kiểm tra quyền xóa post: ", e);
        }

        throw new AppException(ErrorCode.UNAUTHORIZED);
    }


    @PostMapping("/{postId}/like")
    @PreAuthorize("hasAuthority('CREATE_LIKE')")
    public ApiResponse<LikeResponse> likePost(@PathVariable String postId){
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
    public ApiResponse<Void> unlikePost(@PathVariable String postId){
        String userId = userService.getMyInfo().getId();
        likeRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, "post", postId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/{postId}/comments")
    @PreAuthorize("hasAuthority('READ_COMMENT')")
    public ApiResponse<List<CommentResponse>> getPostComments(@PathVariable String postId){
        return ApiResponse.<List<CommentResponse>>builder()
                .result(commentService.getCommentsByPostId(postId))
                .build();
    }

    @PostMapping("/{postId}/comments")
    @PreAuthorize("hasAuthority('CREATE_COMMENT')")
    public ApiResponse<CommentResponse> createPostComment(@PathVariable String postId, @RequestBody CommentUpdateRequest body){
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
    public ApiResponse<Void> deletePostComment(@PathVariable String postId, @PathVariable String commentId){
        commentService.deleteComment(commentId);
        return ApiResponse.<Void>builder()
                .build();
    }

    // ========================================================================
    // API TÌM KIẾM CHUNG (QUAN TRỌNG)
    // ========================================================================

    // 1. API cho User thường (Dùng quyền READ_POST)
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('READ_POST')")
    public ApiResponse<Page<PostResponse>> searchPosts(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "all") String eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<PostResponse>>builder()
                .result(postService.searchPosts(search, eventId, page, size))
                .build();
    }

    // 2. API cho Admin (Giữ lại để tương thích code cũ, nhưng trỏ về cùng logic searchPosts)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<PostResponse>> getAllPostsForAdmin(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "all") String eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<PostResponse>>builder()
                .result(postService.searchPosts(search, eventId, page, size))
                .build();
    }
}