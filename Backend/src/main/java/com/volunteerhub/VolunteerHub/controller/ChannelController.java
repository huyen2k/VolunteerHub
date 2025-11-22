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

    @GetMapping
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    ApiResponse<java.util.List<com.volunteerhub.VolunteerHub.dto.response.ChannelResponse>> getChannels(){
        return ApiResponse.<java.util.List<com.volunteerhub.VolunteerHub.dto.response.ChannelResponse>>builder()
                .result(channelService.getAllChannels())
                .build();
    }

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

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    ApiResponse<ChannelResponse> getChannelByEventId(@PathVariable String eventId){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.getChannelByEventId(eventId))
                .build();
    }

    @DeleteMapping("/{channelId}")
    @PreAuthorize("hasAuthority('DELETE_CHANNEL')")
    ApiResponse<Void> delete(@PathVariable String channelId){
        channelService.deleteChannel(channelId);
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/{channelId}/messages")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    ApiResponse<java.util.List<java.util.Map<String, Object>>> getMessages(@PathVariable String channelId, @RequestParam(required = false) Integer limit, @RequestParam(required = false) Integer offset){
        return ApiResponse.<java.util.List<java.util.Map<String, Object>>>builder()
                .result(java.util.List.of())
                .build();
    }

    @PostMapping("/{channelId}/messages")
    @PreAuthorize("hasAuthority('CREATE_CHANNEL')")
    ApiResponse<Void> sendMessage(@PathVariable String channelId, @RequestBody java.util.Map<String, Object> body){
        return ApiResponse.<Void>builder()
                .build();
    }

    @PutMapping("/{channelId}/read")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    ApiResponse<Void> markRead(@PathVariable String channelId){
        return ApiResponse.<Void>builder()
                .build();
    }

    @GetMapping("/{channelId}/unread-count")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    ApiResponse<Long> getUnreadCount(@PathVariable String channelId){
        return ApiResponse.<Long>builder()
                .result(0L)
                .build();
    }
}