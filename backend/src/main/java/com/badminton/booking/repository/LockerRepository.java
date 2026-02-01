package com.badminton.booking.repository;

import com.badminton.booking.entity.Locker;
import com.badminton.booking.entity.enums.LockerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface LockerRepository extends JpaRepository<Locker, Integer> {
    Optional<Locker> findByLockerNumber(String lockerNumber);
    List<Locker> findByStatus(LockerStatus status);
}
