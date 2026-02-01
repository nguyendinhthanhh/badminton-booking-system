package com.badminton.booking.repository;

import com.badminton.booking.entity.Coach;
import com.badminton.booking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CoachRepository extends JpaRepository<Coach, Integer> {
    Optional<Coach> findByUser(User user);
    List<Coach> findBySpecializationContaining(String specialization);
    List<Coach> findByIsAvailable(Boolean isAvailable);
}
