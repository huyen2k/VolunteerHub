package com.volunteerhub.VolunteerHub.config;

import com.volunteerhub.VolunteerHub.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final RoleRepository roleRepository;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String email = jwt.getSubject(); // lấy từ claim 'sub'
        Set<String> roles = new HashSet<>(jwt.getClaimAsStringList("roles"));

        log.info("JWT roles: {}", roles);

        Set<GrantedAuthority> authorities = new HashSet<>();

        // lấy toàn bộ permission từ các role trong DB
        for (String roleName : roles) {
            roleRepository.findById(roleName).ifPresent(role -> {
                authorities.addAll(
                        role.getPermissions().stream()
                                .map(SimpleGrantedAuthority::new)
                                .collect(Collectors.toSet())
                );
            });
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
        }

        log.info("Authorities loaded: {}", authorities);

        return new JwtAuthenticationToken(jwt, authorities, email);
    }
}