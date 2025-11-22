package com.volunteerhub.VolunteerHub.collection;

import com.volunteerhub.VolunteerHub.enums.EventStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "events")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Event {
    @Id
    String id;


    String title;
    String description;

    Date date;
    String time;
    String location;

    String image;
    String category; // VD: "Môi trường", "Giáo dục",...

    int volunteersRegistered; // Số người đã đăng ký
    int volunteersNeeded;     // Số người cần

    List<String> registeredUsers; // Danh sách userId đã đăng ký



    String status;         // pending, approved, rejected, completed

    String approvedBy;     // userId của admin duyệt
    Date approvedAt;

    @CreatedBy
    String createdBy;      // userId tạo event

    @CreatedDate
    Date createdAt;

    @LastModifiedDate
    Date updatedAt;
}
