package com.badminton.booking.repository;

import com.badminton.booking.entity.BookingPriceBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingPriceBreakdownRepository extends JpaRepository<BookingPriceBreakdown, Integer> {
    List<BookingPriceBreakdown> findByBookingId(Integer bookingId);
}

