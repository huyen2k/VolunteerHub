package com.volunteerhub.VolunteerHub.config;

import com.volunteerhub.VolunteerHub.constant.Roles;
import com.volunteerhub.VolunteerHub.collection.User;
import com.volunteerhub.VolunteerHub.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    @Autowired
    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_USER_EMAIL = "admin@example.com";

    @NonFinal
    static final String ADMIN_USER_PASSWORD = "admin";

    @NonFinal
    static final String MANAGER_USER_EMAIL = "manager@example.com";

    @NonFinal
    static final String MANAGER_USER_PASSWORD = "manager";

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository){
        return args -> {
            // Create admin user if not exists
            if(userRepository.findUserByEmail(ADMIN_USER_EMAIL).isEmpty()){
                var roles = new HashSet<String>();
                roles.add(Roles.ADMIN.name());

                User user = User.builder()
                        .email(ADMIN_USER_EMAIL)
                        .password(passwordEncoder.encode(ADMIN_USER_PASSWORD))
                        .roles(roles)
                        .full_name("Admin User")
                        .is_active(true)
                        .build();

                userRepository.save(user);
                log.warn("Admin user has been created with default credentials: {} / {}", ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD);
            }

            // Create manager user if not exists
            if(userRepository.findUserByEmail(MANAGER_USER_EMAIL).isEmpty()){
                var roles = new HashSet<String>();
                roles.add(Roles.EVEN_MANAGER.name());

                User user = User.builder()
                        .email(MANAGER_USER_EMAIL)
                        .password(passwordEncoder.encode(MANAGER_USER_PASSWORD))
                        .roles(roles)
                        .full_name("Event Manager")
                        .is_active(true)
                        .build();

                userRepository.save(user);
                log.warn("Manager user has been created with default credentials: {} / {}", MANAGER_USER_EMAIL, MANAGER_USER_PASSWORD);
            }
        };
    }
}
