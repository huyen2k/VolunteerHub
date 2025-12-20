package com.volunteerhub.VolunteerHub.service;

import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Channel.ChannelUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.ChannelResponse;
import com.volunteerhub.VolunteerHub.exception.AppException;
import com.volunteerhub.VolunteerHub.exception.ErrorCode;
import com.volunteerhub.VolunteerHub.mapper.ChannelMapper;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChannelService {

    ChannelRepository channelRepository;
    ChannelMapper channelMapper;
    EventRepository eventRepository;


    /**
     * Lấy danh sách kênh có phân trang.
     * Dùng cho Sidebar trang Community để không bị lag khi load nhiều kênh.
     */
    public Page<ChannelResponse> getChannels(int page, int size) {
        // Sắp xếp: Kênh mới tạo lên đầu (hoặc tùy logic bạn muốn)
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return channelRepository.findAll(pageable)
                .map(channelMapper::toChannelResponse);
    }

    /**
     * Tìm kiếm kênh (Search Bar trong Community)
     */
    public Page<ChannelResponse> searchChannels(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return channelRepository.searchByName(keyword, pageable)
                .map(channelMapper::toChannelResponse);
    }

    /**
     * Hàm cũ lấy tất cả (Hạn chế dùng, chỉ dùng cho dropdown nhỏ nếu cần)
     */
    public List<ChannelResponse> getAllChannels(){
        return channelRepository.findAll().stream()
                .map(channelMapper::toChannelResponse)
                .toList();
    }

    public ChannelResponse getChannel(String channelId){
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_EXISTED));
        return channelMapper.toChannelResponse(channel);
    }

    public ChannelResponse getChannelByEventId(String eventId){
        Channel channel = channelRepository.findByEventId(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.CHANNEL_NOT_EXISTED));
        return channelMapper.toChannelResponse(channel);
    }


    public ChannelResponse createChannel(ChannelCreationRequest request){
        if(channelRepository.existsByEventId(request.getEventId())){
            throw new AppException(ErrorCode.CHANNEL_EXISTED);
        }

        Channel channel = channelMapper.toChannel(request);

        // Tự động đặt tên kênh nếu null
        if (channel.getName() == null || channel.getName().trim().isEmpty()) {
            String eventId = request.getEventId();

            if ("GLOBAL_FEED".equals(eventId)) {
                channel.setName("Cộng đồng chung");
            }
            else if (eventId != null && !eventId.isEmpty()) {
                // Tìm tên sự kiện để đặt tên kênh cho đẹp
                String eventTitle = eventRepository.findById(eventId)
                        .map(Event::getTitle)
                        .orElse("Sự kiện");
                channel.setName("Thảo luận: " + eventTitle);
            }
            else {
                channel.setName("Kênh thảo luận");
            }
        }

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

    public void deleteChannel(String channelId){
        channelRepository.deleteById(channelId);
    }
}