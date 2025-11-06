package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Like.LikeCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Like.LikeUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.LikeResponse;
import com.volunteerhub.VolunteerHub.service.LikeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LikeController {
    @Autowired
    LikeService likeService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_LIKE')")
    ApiResponse<LikeResponse> createLike(@RequestBody LikeCreationRequest request){
        return ApiResponse.<LikeResponse>builder()
                .result(likeService.createLike(request))
                .build();
    }

    @PutMapping("/{likeId}")
    @PreAuthorize("hasAuthority('UPDATE_LIKE')")
    ApiResponse<LikeResponse> updateLike(@PathVariable String likeId, @RequestBody LikeUpdateRequest request){
        return ApiResponse.<LikeResponse>builder()
                .result(likeService.updateLike(likeId, request))
                .build();
    }

    @GetMapping("/{likeId}")
    @PreAuthorize("hasAuthority('READ_LIKE')")
    ApiResponse<LikeResponse> getLike(@PathVariable String likeId){
        return ApiResponse.<LikeResponse>builder()
                .result(likeService.getLike(likeId))
                .build();
    }

    @DeleteMapping("/{likeId}")
    @PreAuthorize("hasAuthority('DELETE_LIKE')")
    ApiResponse<Void> deleteLike(@PathVariable String likeId){
        likeService.deleteLike(likeId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('READ_LIKE')")
    ApiResponse<List<LikeResponse>> getLikesByUser(@PathVariable String userId){
        return ApiResponse.<List<LikeResponse>>builder()
                .result(likeService.getLikesByUserId(userId))
                .build();
    }

    @GetMapping("/target/{targetType}/{targetId}")
    @PreAuthorize("hasAuthority('READ_LIKE')")
    ApiResponse<List<LikeResponse>> getLikesByTarget(@PathVariable String targetType, @PathVariable String targetId){
        return ApiResponse.<List<LikeResponse>>builder()
                .result(likeService.getLikesByTarget(targetType, targetId))
                .build();
    }

    @GetMapping("/target/{targetType}/{targetId}/count")
    @PreAuthorize("hasAuthority('READ_LIKE')")
    ApiResponse<Long> getLikeCountByTarget(@PathVariable String targetType, @PathVariable String targetId){
        return ApiResponse.<Long>builder()
                .result(likeService.getLikeCountByTarget(targetType, targetId))
                .build();
    }

    @GetMapping("/user/{userId}/target/{targetType}/{targetId}")
    @PreAuthorize("hasAuthority('READ_LIKE')")
    ApiResponse<Boolean> checkUserLike(@PathVariable String userId, @PathVariable String targetType, @PathVariable String targetId){
        return ApiResponse.<Boolean>builder()
                .result(likeService.existsByUserAndTarget(userId, targetType, targetId))
                .build();
    }
}