package com.res.server.backend.repository;

import com.res.server.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailAndEnabledTrue(String email);

    Collection<Object> findByEmail(String mail);
    boolean existsByEmail(String email);
}
//This will be used by Spring Security later