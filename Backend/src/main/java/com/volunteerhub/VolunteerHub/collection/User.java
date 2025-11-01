package com.volunteerhub.VolunteerHub.collection;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.Set;

@Document(collection = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    String id;
    String email; //unique
    @Field("password_hash")
    String password;

    @DBRef
    Set<String> roles; //['volunteer', 'event_manager', 'admin']

    String full_name;
    String avatar_url;
    String phone;
    String address;
    String bio;

    Boolean is_active;

    @CreatedDate
    Date created_at;

    @LastModifiedDate
    Date updated_at;
}
