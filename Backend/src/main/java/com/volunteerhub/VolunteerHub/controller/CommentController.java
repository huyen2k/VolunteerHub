package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.CommentResponse;
import com.volunteerhub.VolunteerHub.service.CommentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommentController {
    @Autowired
    CommentService commentService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_COMMENT')")
    ApiResponse<CommentResponse> createComment(@RequestBody CommentCreationRequest request){
        return ApiResponse.<CommentResponse>builder()
                .result(commentService.createComment(request))
                .build();
    }

    @PutMapping("/{commentId}")
    @PreAuthorize("hasAuthority('UPDATE_COMMENT')")
    ApiResponse<CommentResponse> updateComment(@PathVariable String commentId, @RequestBody CommentUpdateRequest request){
        return ApiResponse.<CommentResponse>builder()
                .result(commentService.updateComment(commentId, request))
                .build();
    }

    @GetMapping("/{commentId}")
    @PreAuthorize("hasAuthority('READ_COMMENT')")
    ApiResponse<CommentResponse> getComment(@PathVariable String commentId){
        return ApiResponse.<CommentResponse>builder()
                .result(commentService.getComment(commentId))
                .build();
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasAuthority('DELETE_COMMENT')")
    ApiResponse<Void> deleteComment(@PathVariable String commentId){
        commentService.deleteComment(commentId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/post/{postId}")
    @PreAuthorize("hasAuthority('READ_COMMENT')")
    ApiResponse<List<CommentResponse>> getCommentsByPost(@PathVariable String postId){
        return ApiResponse.<List<CommentResponse>>builder()
                .result(commentService.getCommentsByPostId(postId))
                .build();
    }

    @GetMapping("/author/{authorId}")
    @PreAuthorize("hasAuthority('READ_COMMENT')")
    ApiResponse<List<CommentResponse>> getCommentsByAuthor(@PathVariable String authorId){
        return ApiResponse.<List<CommentResponse>>builder()
                .result(commentService.getCommentsByAuthorId(authorId))
                .build();
    }
}