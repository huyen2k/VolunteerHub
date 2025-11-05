package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Comment;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.CommentResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CommentMapper {
    Comment toComment(CommentCreationRequest request);
    void updateComment(@MappingTarget Comment comment, CommentUpdateRequest request);
    CommentResponse toCommentResponse(Comment comment);
}