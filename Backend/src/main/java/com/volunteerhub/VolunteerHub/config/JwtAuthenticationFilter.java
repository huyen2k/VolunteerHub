package com.volunteerhub.VolunteerHub.config;

import com.volunteerhub.VolunteerHub.repository.RoleRepository;
import com.volunteerhub.VolunteerHub.service.AuthenticationService;
import com.volunteerhub.VolunteerHub.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final RoleRepository roleRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Không có token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        String email = jwtService.extractUsername(token);
        Set<String> roleNames = jwtService.extractRoles(token);

        log.warn("Role" + roleNames.toString());

        // Nếu user chưa xác thực
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Set<GrantedAuthority> authorities = new HashSet<>();

            if (roleNames != null) {
                for (String roleName : roleNames) {
                    roleRepository.findById(roleName).ifPresent(role ->
                            authorities.addAll(
                                    role.getPermissions().stream()
                                            .map(SimpleGrantedAuthority::new)
                                            .collect(Collectors.toSet())
                            )
                    );
                }

            }

            log.warn("author" + authorities.toString());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, authorities);

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
