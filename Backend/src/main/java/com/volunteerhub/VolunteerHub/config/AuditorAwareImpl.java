package com.volunteerhub.VolunteerHub.config;

import lombok.NonNull;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAware")
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    @NonNull
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Kiểm tra xem authentication có null không, và đã đăng nhập chưa
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.empty(); // Trả về rỗng nếu chưa đăng nhập (hoặc hệ thống tự chạy)
        }

        return Optional.of(authentication.getName());
    }
}
