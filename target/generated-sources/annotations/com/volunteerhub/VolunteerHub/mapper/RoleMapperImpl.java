package com.volunteerhub.VolunteerHub.mapper;

import com.volunteerhub.VolunteerHub.collection.Role;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleCreationRequest;
import com.volunteerhub.VolunteerHub.dto.request.Role.RoleUpdateRequest;
import com.volunteerhub.VolunteerHub.dto.response.RoleResponse;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-12-18T22:19:12+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.8 (Microsoft)"
)
@Component
public class RoleMapperImpl implements RoleMapper {

    @Override
    public Role toRole(RoleCreationRequest request) {
        if ( request == null ) {
            return null;
        }

        Role.RoleBuilder role = Role.builder();

        role.name( request.getName() );
        role.description( request.getDescription() );

        return role.build();
    }

    @Override
    public RoleResponse toRoleResponse(Role role) {
        if ( role == null ) {
            return null;
        }

        RoleResponse.RoleResponseBuilder roleResponse = RoleResponse.builder();

        roleResponse.name( role.getName() );
        roleResponse.description( role.getDescription() );
        Set<String> set = role.getPermissions();
        if ( set != null ) {
            roleResponse.permissions( new LinkedHashSet<String>( set ) );
        }

        return roleResponse.build();
    }

    @Override
    public void updateRole(Role role, RoleUpdateRequest request) {
        if ( request == null ) {
            return;
        }

        if ( role.getPermissions() != null ) {
            List<String> list = request.getPermissions();
            if ( list != null ) {
                role.getPermissions().clear();
                role.getPermissions().addAll( list );
            }
            else {
                role.setPermissions( null );
            }
        }
        else {
            List<String> list = request.getPermissions();
            if ( list != null ) {
                role.setPermissions( new LinkedHashSet<String>( list ) );
            }
        }
    }
}
