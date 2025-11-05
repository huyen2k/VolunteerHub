package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ChannelResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ChannelMapper {
    Channel toChannel(ChannelCreationRequest request);
    void updateChannel(@MappingTarget Channel channel, ChannelUpdateRequest request);
    ChannelResponse toChannelResponse(Channel channel);
}