package com.volunteerhub.VolunteerHub.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Profile {
    private String full_name;
    private String avatar_url;
    private String phone;
    private String address;
    private String bio;
}
