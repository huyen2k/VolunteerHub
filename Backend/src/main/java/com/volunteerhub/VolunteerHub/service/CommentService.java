package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Comment;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.CommentResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.CommentMapper;
import com.volunteerhub.VolunteerHub.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import com.volunteerhub.VolunteerHub.service.UserService;
import com.volunteerhub.VolunteerHub.repository.PostRepository;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import com.volunteerhub.VolunteerHub.collection.Post;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    @Autowired
    CommentRepository commentRepository;

    @Autowired
    CommentMapper commentMapper;

    @Autowired
    NotificationService notificationService;

    @Autowired
    PostRepository postRepository;

    @Autowired
    ChannelRepository channelRepository;

    @Autowired
    EventRepository eventRepository;

    @Autowired
    UserService userService;

    public CommentResponse createComment(CommentCreationRequest request){
        Comment comment = commentMapper.toComment(request);

        commentRepository.save(comment);

        CommentResponse res = commentMapper.toCommentResponse(comment);
        try {
            var author = userService.getUserById(comment.getAuthorId());
            res.setAuthorName(author.getFull_name());
        } catch (Exception ignored) {}

        if (comment.getPostId() != null) {
            Post post = postRepository.findById(comment.getPostId()).orElse(null);
            if (post != null) {
                if (post.getAuthorId() != null) {
                    notificationService.createNotificationForUser(
                            post.getAuthorId(),
                            "post_comment",
                            "Bài viết của bạn nhận được một bình luận mới"
                    );
                }
                if (post.getChannelId() != null) {
                    var channel = channelRepository.findById(post.getChannelId()).orElse(null);
                    if (channel != null && channel.getEventId() != null && !"GLOBAL_FEED".equals(channel.getEventId())) {
                        var event = eventRepository.findById(channel.getEventId()).orElse(null);
                        if (event != null && event.getCreatedBy() != null) {
                            notificationService.createNotificationForUser(
                                    event.getCreatedBy(),
                                    "event_post_comment",
                                    "Có bình luận mới trong bài viết thuộc sự kiện của bạn"
                            );
                        }
                    }
                }
            }
        }

        return res;
    }

    public CommentResponse updateComment(String commentId, CommentUpdateRequest request){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_EXISTED));
        commentMapper.updateComment(comment, request);
        commentRepository.save(comment);
        return commentMapper.toCommentResponse(comment);
    }

    public CommentResponse getComment(String commentId){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_EXISTED));
        return commentMapper.toCommentResponse(comment);
    }

    public void deleteComment(String commentId){
        commentRepository.deleteById(commentId);
    }

    public List<CommentResponse> getCommentsByPostId(String postId){
        var list = commentRepository.findByPostId(postId)
                .stream()
                .map(commentMapper::toCommentResponse)
                .toList();
        for (var c : list) {
            try {
                var author = userService.getUserById(c.getAuthorId());
                c.setAuthorName(author.getFull_name());
            } catch (Exception ignored) {}
        }
        return list;
    }

    public List<CommentResponse> getCommentsByAuthorId(String authorId){
        return commentRepository.findByAuthorId(authorId)
                .stream()
                .map(commentMapper::toCommentResponse)
                .toList();
    }

    public long getCommentCountByPostId(String postId) {
        return commentRepository.countByPostId(postId);
    }
}