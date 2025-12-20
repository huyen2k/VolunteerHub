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
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/channels")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChannelController {

    ChannelService channelService;

    @GetMapping
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    public ApiResponse<Page<ChannelResponse>> getChannels(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Nếu có từ khóa -> Tìm kiếm
        if (keyword != null && !keyword.trim().isEmpty()) {
            return ApiResponse.<Page<ChannelResponse>>builder()
                    .result(channelService.searchChannels(keyword, page, size))
                    .build();
        }

        // Mặc định -> Lấy danh sách phân trang (Sidebar load nhanh)
        return ApiResponse.<Page<ChannelResponse>>builder()
                .result(channelService.getChannels(page, size))
                .build();
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    public ApiResponse<List<ChannelResponse>> getAllChannelsNoPaging(){
        return ApiResponse.<List<ChannelResponse>>builder()
                .result(channelService.getAllChannels())
                .build();
    }

    @GetMapping("/{channelId}")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    public ApiResponse<ChannelResponse> getChannel(@PathVariable String channelId){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.getChannel(channelId))
                .build();
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    public ApiResponse<ChannelResponse> getChannelByEventId(@PathVariable String eventId){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.getChannelByEventId(eventId))
                .build();
    }


    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_CHANNEL')")
    public ApiResponse<ChannelResponse> createChannel(@RequestBody ChannelCreationRequest request){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.createChannel(request))
                .build();
    }

    @PutMapping("/{channelId}")
    @PreAuthorize("hasAuthority('UPDATE_CHANNEL')")
    public ApiResponse<ChannelResponse> updateChannel(@PathVariable String channelId, @RequestBody ChannelUpdateRequest request){
        return ApiResponse.<ChannelResponse>builder()
                .result(channelService.updateChannel(channelId, request))
                .build();
    }

    @DeleteMapping("/{channelId}")
    @PreAuthorize("hasAuthority('DELETE_CHANNEL')")
    public ApiResponse<Void> delete(@PathVariable String channelId){
        channelService.deleteChannel(channelId);
        return ApiResponse.<Void>builder().build();
    }


    @GetMapping("/{channelId}/messages")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    public ApiResponse<List<Map<String, Object>>> getMessages(
            @PathVariable String channelId,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer offset){
        return ApiResponse.<List<Map<String, Object>>>builder()
                .result(List.of())
                .build();
    }

    @PostMapping("/{channelId}/messages")
    @PreAuthorize("hasAuthority('CREATE_CHANNEL')")
    public ApiResponse<Void> sendMessage(@PathVariable String channelId, @RequestBody Map<String, Object> body){
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/{channelId}/read")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    public ApiResponse<Void> markRead(@PathVariable String channelId){
        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/{channelId}/unread-count")
    @PreAuthorize("hasAuthority('READ_CHANNEL')")
    public ApiResponse<Long> getUnreadCount(@PathVariable String channelId){
        return ApiResponse.<Long>builder()
                .result(0L)
                .build();
    }
}