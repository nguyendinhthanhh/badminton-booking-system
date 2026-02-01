package com.badminton.booking.repository;

import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.User;
import com.badminton.booking.entity.BadmintonCourt;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
