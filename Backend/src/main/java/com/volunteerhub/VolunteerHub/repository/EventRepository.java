package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Event;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByCreatedBy(String createdBy); // Lấy list của Manager
    long countByStatus(String status); // Đếm theo trạng thái
    long countByDateAfter(Date date); // Đếm sự kiện sắp tới
    long countByCreatedAtAfter(Date date); // Đếm sự kiện mới tạo
    List<Event> findTop5ByOrderByCreatedAtDesc(); // Lấy 5 sự kiện mới nhất
}
