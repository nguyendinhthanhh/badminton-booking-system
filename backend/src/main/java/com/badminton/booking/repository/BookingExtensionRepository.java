package com.badminton.booking.repository;

import com.badminton.booking.entity.BookingExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingExtensionRepository extends JpaRepository<BookingExtension, Integer> {
    List<BookingExtension> findByBookingId(Integer bookingId);
}

