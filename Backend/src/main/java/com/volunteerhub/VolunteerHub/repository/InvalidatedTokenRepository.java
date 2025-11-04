package com.volunteerhub.VolunteerHub.repository;

import com.volunteerhub.VolunteerHub.collection.InvalidatedToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvalidatedTokenRepository extends MongoRepository<InvalidatedToken, String> {
}
