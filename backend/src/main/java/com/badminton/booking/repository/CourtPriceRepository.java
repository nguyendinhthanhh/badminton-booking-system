package com.badminton.booking.repository;

import com.badminton.booking.entity.CourtPrice;
import com.badminton.booking.entity.enums.DayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    // ===== QUERIES CHO SINGLE COURT =====

    /**
     * Lấy giá thấp nhất của sân (tất cả loại ngày)
     */
    @Query("SELECT MIN(cp.pricePerHour) FROM CourtPrice cp WHERE cp.court.id = :courtId AND cp.isActive = true")
    BigDecimal findMinPriceByCourtId(@Param("courtId") Integer courtId);

    /**
     * Lấy giá cao nhất của sân (tất cả loại ngày)
     */
    @Query("SELECT MAX(cp.pricePerHour) FROM CourtPrice cp WHERE cp.court.id = :courtId AND cp.isActive = true")
    BigDecimal findMaxPriceByCourtId(@Param("courtId") Integer courtId);

    /**
     * Lấy giờ mở cửa sớm nhất của sân
     */
    @Query("SELECT MIN(cp.startTime) FROM CourtPrice cp WHERE cp.court.id = :courtId AND cp.isActive = true")
    LocalTime findOpenTimeByCourtId(@Param("courtId") Integer courtId);

    /**
     * Lấy giờ đóng cửa muộn nhất của sân
     */
    @Query("SELECT MAX(cp.endTime) FROM CourtPrice cp WHERE cp.court.id = :courtId AND cp.isActive = true")
    LocalTime findCloseTimeByCourtId(@Param("courtId") Integer courtId);

    // ===== BULK QUERIES - TỐI ƯU CHO getAll =====

    /**
     * Lấy summary giá của TẤT CẢ sân trong 1 query
     * Trả về: [courtId, minPrice, maxPrice, openTime, closeTime]
     */
    @Query("SELECT cp.court.id, MIN(cp.pricePerHour), MAX(cp.pricePerHour), MIN(cp.startTime), MAX(cp.endTime) " +
           "FROM CourtPrice cp WHERE cp.isActive = true GROUP BY cp.court.id")
    List<Object[]> findAllCourtPriceSummary();

    /**
     * Lấy summary giá của các sân cụ thể trong 1 query
     */
    @Query("SELECT cp.court.id, MIN(cp.pricePerHour), MAX(cp.pricePerHour), MIN(cp.startTime), MAX(cp.endTime) " +
           "FROM CourtPrice cp WHERE cp.court.id IN :courtIds AND cp.isActive = true GROUP BY cp.court.id")
    List<Object[]> findCourtPriceSummaryByCourtIds(@Param("courtIds") List<Integer> courtIds);
}
