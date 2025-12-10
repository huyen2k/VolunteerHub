package com.volunteerhub.VolunteerHub.config;

import com.volunteerhub.VolunteerHub.constant.Roles;
import com.volunteerhub.VolunteerHub.collection.User;
import com.volunteerhub.VolunteerHub.collection.Role;
import com.volunteerhub.VolunteerHub.repository.UserRepository;
import com.volunteerhub.VolunteerHub.repository.RoleRepository;
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
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository){
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
                        .isActive(true)
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
                        .isActive(true)
                        .build();

                userRepository.save(user);
                log.warn("Manager user has been created with default credentials: {} / {}", MANAGER_USER_EMAIL, MANAGER_USER_PASSWORD);
            }

            // Seed roles with baseline permissions if not exists
            seedRole(roleRepository, Roles.VOLUNTEER.name(),
                    new String[]{
                            "READ_POST", "CREATE_POST",
                            "READ_COMMENT", "CREATE_COMMENT",
                            "READ_LIKE", "CREATE_LIKE",
                            "READ_CHANNEL",
                            "CREATE_REGISTRATION", "READ_REGISTRATION",
                            "CREATE_REPORT"
                    },
                    "Volunteer baseline permissions");

            seedRole(roleRepository, Roles.EVEN_MANAGER.name(),
                    new String[]{
                            "READ_POST", "CREATE_POST",
                            "READ_COMMENT", "CREATE_COMMENT",
                            "READ_LIKE", "CREATE_LIKE",
                            "READ_CHANNEL",
                            "CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT",
                            "READ_REGISTRATION", "UPDATE_REGISTRATION",
                            "CREATE_REPORT"
                    },
                    "Event manager permissions");

            seedRole(roleRepository, Roles.ADMIN.name(),
                    new String[]{
                            "READ_POST", "CREATE_POST", "DELETE_POST",
                            "READ_COMMENT", "CREATE_COMMENT", "DELETE_COMMENT",
                            "READ_LIKE", "CREATE_LIKE", "DELETE_LIKE",
                            "READ_CHANNEL", "CREATE_CHANNEL",
                            "APPROVE_EVENT", "UPDATE_EVENT", "DELETE_EVENT",
                            "USER_LIST", "ROLE_LIST", "UPDATE_PERMISSION",
                            "DELETE_USER",
                            "READ_REGISTRATION", "UPDATE_REGISTRATION", "DELETE_REGISTRATION",
                            "READ_REPORT", "UPDATE_REPORT"
                    },
                    "Administrator full permissions");
        };
    }

    private void seedRole(RoleRepository roleRepository, String roleName, String[] permissions, String description){
        var existing = roleRepository.findByName(roleName);
        if(existing.isEmpty()){
            var role = Role.builder()
                    .name(roleName)
                    .description(description)
                    .permissions(new java.util.HashSet<>(java.util.Arrays.asList(permissions)))
                    .build();
            roleRepository.save(role);
            log.warn("Role '{}' has been created with {} permissions", roleName, permissions.length);
        } else {
            var role = existing.get();
            if(role.getPermissions() == null){
                role.setPermissions(new java.util.HashSet<>());
            }
            var before = role.getPermissions().size();
            java.util.Arrays.stream(permissions).forEach(p -> role.getPermissions().add(p));
            if(role.getPermissions().size() != before){
                roleRepository.save(role);
                log.warn("Role '{}' permissions updated ({} -> {})", roleName, before, role.getPermissions().size());
            }
        }
    }
}
