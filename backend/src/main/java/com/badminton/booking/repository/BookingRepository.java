package com.badminton.booking.repository;

import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.User;
import com.badminton.booking.entity.BadmintonCourt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByUser(User user);
    List<Booking> findByCourt(BadmintonCourt court);
    List<Booking> findByPlayDate(LocalDate playDate);
    List<Booking> findByStatus(String status);
    List<Booking> findByPaymentStatus(String paymentStatus);

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
}
