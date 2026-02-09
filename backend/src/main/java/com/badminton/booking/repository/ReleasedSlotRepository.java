package com.badminton.booking.repository;

import com.badminton.booking.entity.ReleasedSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReleasedSlotRepository extends JpaRepository<ReleasedSlot, Integer> {

    /**
     * Tìm released slot theo source booking
     */
    Optional<ReleasedSlot> findBySourceBookingId(Integer sourceBookingId);

    /**
     * Kiểm tra booking đã được release chưa
     */
    boolean existsBySourceBookingId(Integer sourceBookingId);

    /**
     * Lấy các slot available của sân trong ngày
     */
    List<ReleasedSlot> findByCourtIdAndPlayDateAndStatus(Integer courtId, LocalDate playDate, String status);

    /**
     * Lấy tất cả slot available trong ngày
     */
    @Query("SELECT rs FROM ReleasedSlot rs WHERE rs.playDate = :playDate AND rs.status = 'AVAILABLE'")
    List<ReleasedSlot> findAvailableSlotsByDate(@Param("playDate") LocalDate playDate);

    /**
     * Lấy slot available của sân trong ngày với thời gian cụ thể
     */
    @Query("SELECT rs FROM ReleasedSlot rs WHERE rs.court.id = :courtId " +
           "AND rs.playDate = :playDate " +
           "AND rs.status = 'AVAILABLE' " +
           "AND rs.startTime <= :startTime " +
           "AND rs.endTime >= :endTime")
    List<ReleasedSlot> findAvailableSlotsContaining(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    /**
     * Lấy các slot available có overlap với thời gian cho trước
     */
    @Query("SELECT rs FROM ReleasedSlot rs WHERE rs.court.id = :courtId " +
           "AND rs.playDate = :playDate " +
           "AND rs.status = 'AVAILABLE' " +
           "AND rs.startTime < :endTime " +
           "AND rs.endTime > :startTime")
    List<ReleasedSlot> findOverlappingAvailableSlots(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}

