package com.medical.inventory.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    // =====================================================
    // FIND BY EMAIL
    // =====================================================

    Optional<User> findByEmailIgnoreCase(
            String email
    );

    // =====================================================
    // CHECK EMAIL
    // =====================================================

    boolean existsByEmailIgnoreCase(
            String email
    );

    // =====================================================
    // FIND BY MOBILE NUMBER
    // =====================================================

    Optional<User> findByMobileNumber(
            String mobileNumber
    );

    // =====================================================
    // CHECK MOBILE NUMBER
    // =====================================================

    boolean existsByMobileNumber(
            String mobileNumber
    );
}