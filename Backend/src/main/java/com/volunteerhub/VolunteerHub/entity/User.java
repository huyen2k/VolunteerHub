package com.volunteerhub.VolunteerHub.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Field("_id")
    private ObjectId id;
    private String email;
    @Field("password_hash")
    private String password;
    private String role; //['volunteer', 'event_manager', 'admin']
    private Profile profile = new Profile();
    private Boolean is_active;

}
