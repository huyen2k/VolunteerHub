package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Like;
import com.volunteerhub.VolunteerHub.dto.request.Like.LikeCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Like.LikeUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.LikeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LikeMapper {
    Like toLike(LikeCreationRequest request);
    void updateLike(@MappingTarget Like like, LikeUpdateRequest request);
    LikeResponse toLikeResponse(Like like);
}