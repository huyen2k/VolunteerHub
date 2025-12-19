package com.volunteerhub.VolunteerHub.config;

import com.volunteerhub.VolunteerHub.collection.Channel;
import com.volunteerhub.VolunteerHub.collection.Event;
import com.volunteerhub.VolunteerHub.collection.Post;
import com.volunteerhub.VolunteerHub.repository.ChannelRepository;
import com.volunteerhub.VolunteerHub.repository.EventRepository;
import com.volunteerhub.VolunteerHub.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

//@Component
public class DataRecovery implements CommandLineRunner {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private PostRepository postRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("BẮT ĐẦU QUÉT VÀ KHÔI PHỤC CHANNEL...");

        // 1. Lấy tất cả sự kiện đã duyệt
        List<Event> approvedEvents = eventRepository.findAll().stream()
                .filter(e -> "approved".equals(e.getStatus()))
                .toList();

        int restoredCount = 0;

        for (Event event : approvedEvents) {
            // 2. Kiểm tra xem sự kiện này còn Channel không
            if (!channelRepository.existsByEventId(event.getId())) {
                System.out.println("   --> Đang tạo lại channel cho sự kiện: " + event.getTitle());

                // 3. Tạo lại Channel
                Channel newChannel = new Channel();
                newChannel.setEventId(event.getId());
                newChannel.setName("Thảo luận: " + event.getTitle());
                newChannel.setType("EVENT_DISCUSSION"); // Quan trọng
                newChannel.setPostCount(1);
                newChannel.setCreatedAt(new Date());
                Channel savedChannel = channelRepository.save(newChannel);

                // 4. Tạo bài post chào mừng (để không bị trống)
                Post welcomePost = new Post();
                welcomePost.setChannelId(savedChannel.getId());
                welcomePost.setContent("Kênh thảo luận đã được khôi phục. Mọi người có thể tiếp tục trò chuyện.");
                welcomePost.setAuthorName("Hệ thống");
                welcomePost.setAuthorAvatar("https://cdn-icons-png.flaticon.com/512/1041/1041883.png");
                welcomePost.setCreatedAt(new Date());
                welcomePost.setLikesCount(0L);
                welcomePost.setCommentsCount(0L);
                welcomePost.setImages(List.of());
                postRepository.save(welcomePost);

                restoredCount++;
            }
        }

        System.out.println("Đã khôi phục " + restoredCount + " channel.");
        System.out.println("F5 lại trang web để kiểm tra.");
    }
}