package com.volunteerhub.VolunteerHub.controller;

import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ApiResponse;
import com.volunteerhub.VolunteerHub.dto.response.ChannelResponse;
import com.volunteerhub.VolunteerHub.service.ChannelService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/channels")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChannelController {
    @Autowired
    ChannelService channelService;

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_CHANNEL')")
    ApiResponse<ChannelResponse> createChannel(@RequestBody ChannelCreationRequest request){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.createChannel(request))
                .build();
    }

    @PutMapping("/{channelId}")
    @PreAuthorize("hasAuthority('UPDATE_CHANNEL')")
    ApiResponse<ChannelResponse> updateChannel(@PathVariable String channelId, @RequestBody ChannelUpdateRequest request){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.updateChannel(channelId, request))
                .build();
    }

    @GetMapping("/{channelId}")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    ApiResponse<ChannelResponse> getChannel(@PathVariable String channelId){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.getChannel(channelId))
                .build();
    }

    @DeleteMapping("/{channelId}")
    @PreAuthorize("hasAuthority('DELETE_CHANNEL')")
    ApiResponse<Void> delete(@PathVariable String channelId){
        channelService.deleteChannel(channelId);
        return ApiResponse.<Void>builder()
                .build();
    }
}