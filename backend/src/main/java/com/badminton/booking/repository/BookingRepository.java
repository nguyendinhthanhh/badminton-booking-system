package com.badminton.booking.repository;

import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    interface RevenueByDateView {
        LocalDate getPlayDate();
        BigDecimal getRevenue();
    }

    interface TopCourtView {
        Integer getCourtId();
        String getCourtName();
        Long getBookings();
        BigDecimal getRevenue();
    }

    interface RecentBookingView {
        Integer getBookingId();
        String getCustomerName();
        String getCourtName();
        LocalDate getPlayDate();
        LocalTime getStartTime();
        LocalTime getEndTime();
        String getStatus();
        String getPaymentStatus();
    }

    interface StatusCountView {
        String getStatus();
        Long getTotal();
    }

    List<Booking> findByUser(User user);

    List<Booking> findByCourt(BadmintonCourt court);

    List<Booking> findByPlayDate(LocalDate playDate);

    List<Booking> findByStatus(String status);

    List<Booking> findByPaymentStatus(String paymentStatus);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.playDate DESC, b.startTime DESC")
    List<Booking> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
            "AND b.playDate = :playDate " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
            "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId) " +
            "AND :startTime < b.endTime " +
            "AND :endTime > b.startTime")
    List<Booking> findOverlappingBookings(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeBookingId") Integer excludeBookingId);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
            "AND b.playDate = :playDate " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
            "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)")
    List<Booking> findActiveBookingsByCourtAndDate(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("excludeBookingId") Integer excludeBookingId);

    @Query("SELECT b FROM Booking b WHERE b.playDate = :playDate")
    List<Booking> findAllByPlayDate(@Param("playDate") LocalDate playDate);

    @Query("SELECT b FROM Booking b WHERE b.playDate BETWEEN :startDate AND :endDate")
    List<Booking> findAllByPlayDateBetween(@Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId AND b.playDate = :playDate")
    List<Booking> findByCourtIdAndPlayDate(@Param("courtId") Integer courtId, @Param("playDate") LocalDate playDate);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.playDate >= :startDate ORDER BY b.playDate ASC")
    List<Booking> findByUserIdAndPlayDateFrom(@Param("userId") Integer userId,
                                              @Param("startDate") LocalDate startDate);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.playDate BETWEEN :startDate AND :endDate ORDER BY b.playDate ASC")
    List<Booking> findByUserIdAndPlayDateBetween(@Param("userId") Integer userId,
                                                 @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
            "AND b.playDate = :playDate " +
            "AND b.startTime > :afterTime " +
            "AND b.status NOT IN ('CANCELLED', 'NO_SHOW') " +
            "ORDER BY b.startTime ASC")
    List<Booking> findNextBookings(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("afterTime") LocalTime afterTime);

    @Query("SELECT b FROM Booking b WHERE b.court.id = :courtId " +
            "AND b.playDate = :playDate " +
            "AND b.status = 'PLAYING'")
    List<Booking> findPlayingBookings(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate);

    @Query("SELECT b FROM Booking b WHERE b.playDate = :playDate " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW')")
    List<Booking> findAllActiveBookingsByDate(@Param("playDate") LocalDate playDate);

    @Query("SELECT b.court.id, COUNT(b) " +
            "FROM Booking b WHERE b.playDate = :playDate " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
            "AND b.startTime IS NOT NULL AND b.endTime IS NOT NULL " +
            "GROUP BY b.court.id")
    List<Object[]> findTotalBookingsByDate(@Param("playDate") LocalDate playDate);

    @Query("SELECT b.court.id, COUNT(b) FROM Booking b WHERE b.playDate = :playDate " +
            "AND b.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW') " +
            "GROUP BY b.court.id")
    List<Object[]> countActiveBookingsByDate(@Param("playDate") LocalDate playDate);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b " +
            "WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "AND b.status IN ('CONFIRMED', 'PLAYING', 'COMPLETED')")
    BigDecimal sumRevenueBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT COUNT(b) FROM Booking b " +
            "WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "AND b.status NOT IN ('CANCELLED', 'NO_SHOW')")
    Long countBookingsBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT COUNT(DISTINCT b.user.id) FROM Booking b " +
            "WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "AND b.user IS NOT NULL")
    Long countDistinctUsersBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT COUNT(DISTINCT b.court.id) FROM Booking b " +
            "WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "AND b.status IN ('CONFIRMED', 'PLAYING', 'COMPLETED')")
    Long countDistinctBookedCourtsBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT b.playDate AS playDate, COALESCE(SUM(b.totalPrice), 0) AS revenue " +
            "FROM Booking b " +
            "WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "AND b.status IN ('CONFIRMED', 'PLAYING', 'COMPLETED') " +
            "GROUP BY b.playDate " +
            "ORDER BY b.playDate ASC")
    List<RevenueByDateView> summarizeRevenueByDate(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT b.court.id AS courtId, b.court.name AS courtName, COUNT(b) AS bookings, COALESCE(SUM(b.totalPrice), 0) AS revenue " +
            "FROM Booking b " +
            "WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "AND b.status NOT IN ('CANCELLED', 'NO_SHOW') " +
            "GROUP BY b.court.id, b.court.name " +
            "ORDER BY COUNT(b) DESC")
    List<TopCourtView> findTopCourtsBetween(@Param("fromDate") LocalDate fromDate,
                                            @Param("toDate") LocalDate toDate,
                                            Pageable pageable);

    @Query("SELECT b.id AS bookingId, COALESCE(u.fullName, b.guestName, 'Khách lẻ') AS customerName, " +
            "c.name AS courtName, b.playDate AS playDate, b.startTime AS startTime, b.endTime AS endTime, " +
            "b.status AS status, b.paymentStatus AS paymentStatus " +
            "FROM Booking b LEFT JOIN b.user u LEFT JOIN b.court c WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "ORDER BY b.createdAt DESC")
    List<RecentBookingView> findRecentBookingsBetween(@Param("fromDate") LocalDate fromDate,
                                                      @Param("toDate") LocalDate toDate,
                                                      Pageable pageable);

    @Query("SELECT b.status AS status, COUNT(b) AS total " +
            "FROM Booking b WHERE b.playDate BETWEEN :fromDate AND :toDate " +
            "GROUP BY b.status")
    List<StatusCountView> countBookingsByStatusBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);
}
