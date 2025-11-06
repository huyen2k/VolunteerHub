package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.Permission;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;

public interface PermissionRepository extends MongoRepository<Permission, String> {
    void deleteByName(String name);
    Collection<Permission> findAllByNameIn(Collection<Permission> names);
}
