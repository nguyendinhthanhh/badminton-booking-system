package com.badminton.booking.repository;

import com.badminton.booking.entity.EmailVerificationToken;
import com.badminton.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByTokenAndUsedFalse(String token);

    void deleteByUser(User user);
}
