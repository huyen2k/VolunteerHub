package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.EventRegistration;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRegistrationRepository extends MongoRepository<EventRegistration, String> {
    boolean existsByEventId(String eventId);
    boolean existsByUserId(String userId);
    boolean existsByEventIdAndUserId(String eventId, String userId);
    java.util.List<EventRegistration> findByEventId(String eventId);
    java.util.List<EventRegistration> findByUserId(String userId);

    long countByStatus(String status); // Đếm registration theo status
    List<EventRegistration> findByStatus(String status); // Lấy list để tính top volunteer
    long countByEventId(String eventId); // Đếm số người tham gia event cụ thể
    long countByStatusAndEventIdIn(String status, List<String> eventIds);// Đếm theo trạng thái VÀ nằm trong danh sách Event ID
    long countByEventIdIn(List<String> eventIds); // Đếm số lượng đăng ký nằm trong danh sách các Event ID
}
