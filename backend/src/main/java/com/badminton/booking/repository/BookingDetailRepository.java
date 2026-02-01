package com.badminton.booking.repository;

import com.badminton.booking.entity.BookingDetail;
import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, Integer> {
    List<BookingDetail> findByBooking(Booking booking);
    List<BookingDetail> findBySlot(TimeSlot slot); // Changed from findByTimeSlot to findBySlot
    List<BookingDetail> findByStatus(String status);
}
