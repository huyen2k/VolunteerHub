package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Comment;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Comment.CommentUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.CommentResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-06T11:16:52+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class CommentMapperImpl implements CommentMapper {

    @Override
    public Comment toComment(CommentCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Comment.CommentBuilder comment = Comment.builder();

        comment.postId( request.getPostId() );
        comment.authorId( request.getAuthorId() );
        comment.content( request.getContent() );

        return comment.build();
    }

    @Override
    public void updateComment(Comment comment, CommentUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        comment.setContent( request.getContent() );
    }

    @Override
    public CommentResponse toCommentResponse(Comment comment) {
        if ( comment == null ) {
            return null;
        }

        CommentResponse.CommentResponseBuilder commentResponse = CommentResponse.builder();

        commentResponse.id( comment.getId() );
        commentResponse.postId( comment.getPostId() );
        commentResponse.authorId( comment.getAuthorId() );
        commentResponse.content( comment.getContent() );
        commentResponse.createdAt( comment.getCreatedAt() );
        commentResponse.updatedAt( comment.getUpdatedAt() );

        return commentResponse.build();
    }
}
