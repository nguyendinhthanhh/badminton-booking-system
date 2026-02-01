package com.badminton.booking.repository;

import com.badminton.booking.entity.Order;
import com.badminton.booking.entity.User;
import com.badminton.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUser(User user);
    List<Order> findByBooking(Booking booking);
}
