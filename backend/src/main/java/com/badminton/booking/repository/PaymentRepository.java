package com.badminton.booking.repository;

import com.badminton.booking.entity.Payment;
import com.badminton.booking.entity.User;
import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.enums.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByUser(User user);
    List<Payment> findByBooking(Booking booking);
    List<Payment> findByMethod(PaymentMethod method);
}
