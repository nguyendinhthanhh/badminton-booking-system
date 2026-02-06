package com.badminton.booking.repository;

import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.User;
import com.badminton.booking.entity.BadmintonCourt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByUser(User user);
    List<Booking> findByCourt(BadmintonCourt court);
    List<Booking> findByPlayDate(LocalDate playDate);
    List<Booking> findByStatus(String status);
    List<Booking> findByPaymentStatus(String paymentStatus);

    // Lấy tất cả booking của user theo userId
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.playDate DESC, b.startTime DESC")
    List<Booking> findByUserId(@Param("userId") Integer userId);

    // ===== OVERLAP CHECK: Core query =====
    /**
     * Kiểm tra overlap booking theo công thức: (start < existingEnd) && (end > existingStart)
     * Có tính cả buffer time
     *
     * @param courtId ID sân
     * @param playDate Ngày chơi
     * @param startTime Giờ bắt đầu muốn đặt
     * @param endTime Giờ kết thúc muốn đặt
     * @param excludeBookingId Booking ID cần exclude (cho update)
     * @return Danh sách booking bị overlap
     */
    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
           "AND b.playDate = :playDate " +
           "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId) " +
           "AND :startTime < FUNCTION('ADDTIME', b.endTime, FUNCTION('SEC_TO_TIME', b.bufferMinutes * 60)) " +
           "AND :endTime > b.startTime")
    List<Booking> findOverlappingBookings(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeBookingId") Integer excludeBookingId);

    /**
     * Version đơn giản hơn cho PostgreSQL - xử lý buffer trong Java
     */
    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
           "AND b.playDate = :playDate " +
           "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)")
    List<Booking> findActiveBookingsByCourtAndDate(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("excludeBookingId") Integer excludeBookingId);

    // Timeline scheduling queries
    @Query("SELECT b FROM Booking b WHERE b.playDate = :playDate")
    List<Booking> findAllByPlayDate(@Param("playDate") LocalDate playDate);

    @Query("SELECT b FROM Booking b WHERE b.playDate BETWEEN :startDate AND :endDate")
    List<Booking> findAllByPlayDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId AND b.playDate = :playDate")
    List<Booking> findByCourtIdAndPlayDate(@Param("courtId") Integer courtId, @Param("playDate") LocalDate playDate);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.playDate >= :startDate ORDER BY b.playDate ASC")
    List<Booking> findByUserIdAndPlayDateFrom(@Param("userId") Integer userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.playDate BETWEEN :startDate AND :endDate ORDER BY b.playDate ASC")
    List<Booking> findByUserIdAndPlayDateBetween(@Param("userId") Integer userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Tìm booking tiếp theo của sân trong ngày (để check gia hạn)
     */
    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
           "AND b.playDate = :playDate " +
           "AND b.startTime > :afterTime " +
           "AND b.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "ORDER BY b.startTime ASC")
    List<Booking> findNextBookings(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("afterTime") LocalTime afterTime);

    /**
     * Tìm booking đang PLAYING của sân
     */
    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
           "AND b.playDate = :playDate " +
           "AND b.status = 'PLAYING'")
    List<Booking> findPlayingBookings(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate);

    // ===== BULK QUERIES - TỐI ƯU CHO getAll Courts =====

    /**
     * Lấy TẤT CẢ booking active của TẤT CẢ sân trong 1 ngày - 1 query duy nhất
     */
    @Query("SELECT b FROM Booking b WHERE b.playDate = :playDate " +
           "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW')")
    List<Booking> findAllActiveBookingsByDate(@Param("playDate") LocalDate playDate);

    /**
     * Lấy tổng thời gian đã book của từng sân trong ngày - 1 query duy nhất
     * Trả về: [courtId, totalBookedMinutes]
     */
    @Query("SELECT b.court.id, SUM(FUNCTION('TIMESTAMPDIFF', MINUTE, b.startTime, b.endTime)) " +
           "FROM Booking b WHERE b.playDate = :playDate " +
           "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
           "AND b.startTime IS NOT NULL AND b.endTime IS NOT NULL " +
           "GROUP BY b.court.id")
    List<Object[]> findTotalBookedMinutesByDate(@Param("playDate") LocalDate playDate);

    /**
     * Đếm số booking active của từng sân trong ngày (backup nếu TIMESTAMPDIFF không work)
     */
    @Query("SELECT b.court.id, COUNT(b) FROM Booking b WHERE b.playDate = :playDate " +
           "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
           "GROUP BY b.court.id")
    List<Object[]> countActiveBookingsByDate(@Param("playDate") LocalDate playDate);
}
