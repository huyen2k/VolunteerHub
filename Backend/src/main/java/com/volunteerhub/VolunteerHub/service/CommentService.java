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
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {
    @Autowired
    CommentRepository commentRepository;

    @Autowired
    CommentMapper commentMapper;

    public CommentResponse createComment(CommentCreationRequest request){
        Comment comment = commentMapper.toComment(request);

        commentRepository.save(comment);

        return commentMapper.toCommentResponse(comment);
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
        return commentRepository.findByPostId(postId)
                .stream()
                .map(commentMapper::toCommentResponse)
                .toList();
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