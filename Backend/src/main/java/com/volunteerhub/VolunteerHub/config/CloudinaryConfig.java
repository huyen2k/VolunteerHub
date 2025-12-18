package com.volunteerhub.VolunteerHub.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dlloqj3ch"); // Thay bằng của bạn
        config.put("api_key", "827766818572521");       // Thay bằng của bạn
        config.put("api_secret", "9zWvZ0LH_q5aDrc4fdc2cfxRpBg");
        config.put("secure", "true");
        return new Cloudinary(config);
    }
}