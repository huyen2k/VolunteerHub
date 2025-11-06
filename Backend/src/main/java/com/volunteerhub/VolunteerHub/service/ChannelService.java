package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ChannelResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.ChannelMapper;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChannelService {
    @Autowired
    ChannelRepository channelRepository;

    @Autowired
    ChannelMapper channelMapper;

    public ChannelResponse createChannel(ChannelCreationRequest request){
        if(channelRepository.existsByEventId(request.getEventId())){
            throw new AppException(ErrorCode.CHANNEL_EXISTED);
        }

        Channel channel = channelMapper.toChannel(request);

        // Set default postCount if not provided
        if(channel.getPostCount() == null) {
            channel.setPostCount(0);
        }

        channelRepository.save(channel);

        return channelMapper.toChannelResponse(channel);
    }

    public ChannelResponse updateChannel(String channelId, ChannelUpdateRequest request){
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_EXISTED));
        channelMapper.updateChannel(channel, request);
        channelRepository.save(channel);
        return channelMapper.toChannelResponse(channel);
    }

    public ChannelResponse getChannel(String channelId){
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_EXISTED));
        return channelMapper.toChannelResponse(channel);
    }

    public void deleteChannel(String channelId){
        channelRepository.deleteById(channelId);
    }

    // Additional method to get channel by eventId
    public ChannelResponse getChannelByEventId(String eventId){
        Channel channel = channelRepository.findByEventId(eventId);
        if(channel == null) {
            throw new AppException(ErrorCode.CHANNEL_NOT_EXISTED);
        }
        return channelMapper.toChannelResponse(channel);
    }
}