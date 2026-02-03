package com.badminton.booking.repository;

import com.badminton.booking.entity.CourtPrice;
import com.badminton.booking.entity.enums.DayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourtPriceRepository extends JpaRepository<CourtPrice, Integer> {

    List<CourtPrice> findByCourtIdAndIsActiveTrue(Integer courtId);

    List<CourtPrice> findByCourtId(Integer courtId);

    List<CourtPrice> findByCourtIdAndDayType(Integer courtId, DayType dayType);

    /**
     * Tìm giá cho sân + loại ngày + thời gian cụ thể
     */
    @Query("SELECT cp FROM CourtPrice cp WHERE cp.court.id = :courtId " +
           "AND cp.dayType = :dayType " +
           "AND cp.startTime <= :time AND cp.endTime > :time " +
           "AND cp.isActive = true")
    Optional<CourtPrice> findPriceForTime(
        @Param("courtId") Integer courtId,
        @Param("dayType") DayType dayType,
        @Param("time") LocalTime time
    );

    /**
     * Kiểm tra trùng khung giờ
     */
    @Query("SELECT cp FROM CourtPrice cp WHERE cp.court.id = :courtId " +
           "AND cp.dayType = :dayType " +
           "AND cp.isActive = true " +
           "AND ((cp.startTime < :endTime AND cp.endTime > :startTime))")
    List<CourtPrice> findOverlappingPrices(
        @Param("courtId") Integer courtId,
        @Param("dayType") DayType dayType,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    boolean existsByCourtIdAndDayTypeAndStartTimeAndEndTime(
        Integer courtId, DayType dayType, LocalTime startTime, LocalTime endTime
    );
}

