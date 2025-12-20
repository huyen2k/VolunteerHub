package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Channel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ChannelRepository extends MongoRepository<Channel, String> {
    boolean existsByEventId(String eventId);
    Optional<Channel> findByEventId(String eventId); // Chuyển sang Optional để an toàn hơn

    // Lấy danh sách kênh có phân trang (Cho Sidebar)
    Page<Channel> findAll(Pageable pageable);

    // Tìm kiếm kênh theo tên (Search Bar trong Community)
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    Page<Channel> searchByName(String name, Pageable pageable);
}