package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByCreatedBy(String createdBy);

    Page<Event> findByCreatedBy(String createdBy, Pageable pageable);

    long countByStatus(String status); // Đếm theo trạng thái
    long countByDateAfter(Date date); // Đếm sự kiện sắp tới
    long countByCreatedAtAfter(Date date); // Đếm sự kiện mới tạo
    List<Event> findTop5ByOrderByCreatedAtDesc(); // Lấy 5 sự kiện mới nhất

    List<Event> findByStatus(String status);
    Page<Event> findByStatus(String status, Pageable pageable);

    Page<Event> findByTitleContainingIgnoreCaseAndStatus(String title, String status, Pageable pageable);
    // Đếm sự kiện sắp tới (Chỉ đếm các sự kiện đã duyệt & chưa diễn ra)
    @Query(value = "{ 'status': 'approved', 'date': { $gt: ?0 } }", count = true)
    long countUpcomingEvents(Date now);

    // Đếm sự kiện đã kết thúc (Đã duyệt & đã qua ngày tổ chức)
    @Query(value = "{ 'status': 'approved', 'date': { $lt: ?0 } }", count = true)
    long countCompletedEvents(Date now);

    // Lấy nhanh top sự kiện mới nhất (Dùng cho phần "Mới công bố")
    List<Event> findTop5ByStatusOrderByCreatedAtDesc(String status);

    @Query("{$or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'location': { $regex: ?0, $options: 'i' } } ]}")
    Page<Event> searchAllEvents(String keyword, Pageable pageable);

    // Tìm kiếm cho USER (Chỉ lấy Approved)
    @Query("{ $and: [ { 'status': 'approved' }, { $or: [ { 'title': { $regex: ?0, $options: 'i' } }, { 'location': { $regex: ?0, $options: 'i' } } ] } ] }")
    Page<Event> searchApprovedEvents(String keyword, Pageable pageable);
}
