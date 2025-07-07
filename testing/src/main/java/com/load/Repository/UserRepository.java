package com.load.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.load.Model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}

