package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Like;
import com.volunteerhub.VolunteerHub.dto.request.Like.LikeCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Like.LikeUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.LikeResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.LikeMapper;
import com.volunteerhub.VolunteerHub.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.volunteerhub.VolunteerHub.repository.PostRepository;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import com.volunteerhub.VolunteerHub.collection.Post;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LikeService {
    @Autowired
    LikeRepository likeRepository;

    @Autowired
    LikeMapper likeMapper;

    @Autowired
    NotificationService notificationService;

    @Autowired
    PostRepository postRepository;

    @Autowired
    ChannelRepository channelRepository;

    @Autowired
    EventRepository eventRepository;

    public LikeResponse createLike(LikeCreationRequest request){
        // Check if user already liked this target
        if(likeRepository.existsByUserIdAndTargetTypeAndTargetId(
                request.getUserId(), request.getTargetType(), request.getTargetId())){
            throw new AppException(ErrorCode.LIKE_EXISTS);
        }

        // Validate target type
        if(!request.getTargetType().equals("post") && !request.getTargetType().equals("comment")){
            throw new AppException(ErrorCode.INVALID_TARGET_TYPE);
        }

        Like like = likeMapper.toLike(request);
        likeRepository.save(like);

        if ("post".equals(request.getTargetType())) {
            Post post = postRepository.findById(request.getTargetId()).orElse(null);
            if (post != null) {
                if (post.getAuthorId() != null) {
                    notificationService.createNotificationForUser(
                            post.getAuthorId(),
                            "post_like",
                            "Bài viết của bạn nhận được một lượt thích"
                    );
                }
                if (post.getChannelId() != null) {
                    var channel = channelRepository.findById(post.getChannelId()).orElse(null);
                    if (channel != null && channel.getEventId() != null && !"GLOBAL_FEED".equals(channel.getEventId())) {
                        var event = eventRepository.findById(channel.getEventId()).orElse(null);
                        if (event != null && event.getCreatedBy() != null) {
                            notificationService.createNotificationForUser(
                                    event.getCreatedBy(),
                                    "event_post_like",
                                    "Có lượt thích mới trong bài viết thuộc sự kiện của bạn"
                            );
                        }
                    }
                }
            }
        }

        return likeMapper.toLikeResponse(like);
    }

    public LikeResponse updateLike(String likeId, LikeUpdateRequest request){
        Like like = likeRepository.findById(likeId)
                .orElseThrow(() -> new AppException(ErrorCode.LIKE_NOT_EXISTED));

        // Validate target type
        if(!request.getTargetType().equals("post") && !request.getTargetType().equals("comment")){
            throw new AppException(ErrorCode.INVALID_TARGET_TYPE);
        }

        likeMapper.updateLike(like, request);
        likeRepository.save(like);
        return likeMapper.toLikeResponse(like);
    }

    public LikeResponse getLike(String likeId){
        Like like = likeRepository.findById(likeId)
                .orElseThrow(() -> new AppException(ErrorCode.LIKE_NOT_EXISTED));
        return likeMapper.toLikeResponse(like);
    }

    public void deleteLike(String likeId){
        likeRepository.deleteById(likeId);
    }

    public void deleteLikeByUserAndTarget(String userId, String targetType, String targetId){
        likeRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
    }

    public List<LikeResponse> getLikesByUserId(String userId){
        return likeRepository.findByUserId(userId)
                .stream()
                .map(likeMapper::toLikeResponse)
                .toList();
    }

    public List<LikeResponse> getLikesByTarget(String targetType, String targetId){
        return likeRepository.findByTargetTypeAndTargetId(targetType, targetId)
                .stream()
                .map(likeMapper::toLikeResponse)
                .toList();
    }

    public long getLikeCountByTarget(String targetType, String targetId){
        return likeRepository.countByTargetTypeAndTargetId(targetType, targetId);
    }

    public boolean existsByUserAndTarget(String userId, String targetType, String targetId){
        return likeRepository.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
    }
}