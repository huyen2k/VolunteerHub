package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ChannelResponse;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-10T20:20:36+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class ChannelMapperImpl implements ChannelMapper {

    @Override
    public Channel toChannel(ChannelCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Channel.ChannelBuilder channel = Channel.builder();

        channel.eventId( request.getEventId() );
        channel.postCount( request.getPostCount() );

        return channel.build();
    }

    @Override
    public void updateChannel(Channel channel, ChannelUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        channel.setEventId( request.getEventId() );
        channel.setPostCount( request.getPostCount() );
    }

    @Override
    public ChannelResponse toChannelResponse(Channel channel) {
        if ( channel == null ) {
            return null;
        }

        ChannelResponse.ChannelResponseBuilder channelResponse = ChannelResponse.builder();

        channelResponse.id( channel.getId() );
        channelResponse.eventId( channel.getEventId() );
        channelResponse.postCount( channel.getPostCount() );
        channelResponse.createdAt( channel.getCreatedAt() );
        channelResponse.updatedAt( channel.getUpdatedAt() );

        return channelResponse.build();
    }
}
