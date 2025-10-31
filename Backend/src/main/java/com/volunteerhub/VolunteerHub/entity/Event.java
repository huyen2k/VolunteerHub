package com.volunteerhub.VolunteerHub.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Date;

@Document(collection = "events")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Event {
    @Field("_id")
    private ObjectId _id;
    private String title;
    private String description;
    private Instant date;
    private String location;
    private String status;
    private ObjectId createdBy;
    private ObjectId approvedBy; // Ref -> users (role: admin)
    private Instant createdAt;
    private Instant updatedAt;


}
