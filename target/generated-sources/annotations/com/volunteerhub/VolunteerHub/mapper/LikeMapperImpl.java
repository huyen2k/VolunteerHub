package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Like;
import com.volunteerhub.VolunteerHub.dto.request.Like.LikeCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Like.LikeUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.LikeResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-12T09:28:34+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class LikeMapperImpl implements LikeMapper {

    @Override
    public Like toLike(LikeCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Like.LikeBuilder like = Like.builder();

        like.userId( request.getUserId() );
        like.targetType( request.getTargetType() );
        like.targetId( request.getTargetId() );

        return like.build();
    }

    @Override
    public void updateLike(Like like, LikeUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        like.setTargetType( request.getTargetType() );
        like.setTargetId( request.getTargetId() );
    }

    @Override
    public LikeResponse toLikeResponse(Like like) {
        if ( like == null ) {
            return null;
        }

        LikeResponse.LikeResponseBuilder likeResponse = LikeResponse.builder();

        likeResponse.id( like.getId() );
        likeResponse.userId( like.getUserId() );
        likeResponse.targetType( like.getTargetType() );
        likeResponse.targetId( like.getTargetId() );
        likeResponse.createdAt( like.getCreatedAt() );
        likeResponse.updatedAt( like.getUpdatedAt() );

        return likeResponse.build();
    }
}
