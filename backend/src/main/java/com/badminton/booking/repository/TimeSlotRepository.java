package com.badminton.booking.repository;

import com.badminton.booking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {
    Optional<TimeSlot> findByStartTimeAndEndTime(LocalTime startTime, LocalTime endTime);

    // Timeline scheduling queries
    List<TimeSlot> findByIsActiveTrueOrderByStartTimeAsc();

    @Query("SELECT MIN(ts.startTime) FROM TimeSlot ts WHERE ts.isActive = true")
    LocalTime findEarliestStartTime();

    @Query("SELECT MAX(ts.endTime) FROM TimeSlot ts WHERE ts.isActive = true")
    LocalTime findLatestEndTime();
}
