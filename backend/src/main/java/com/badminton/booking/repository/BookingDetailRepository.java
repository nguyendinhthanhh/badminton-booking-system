package com.badminton.booking.repository;

import com.badminton.booking.entity.BookingDetail;
import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, Integer> {
    List<BookingDetail> findByBooking(Booking booking);
    List<BookingDetail> findBySlot(TimeSlot slot); // Changed from findByTimeSlot to findBySlot
    List<BookingDetail> findByStatus(String status);

    // Timeline scheduling queries
    @Query("SELECT bd FROM BookingDetail bd WHERE bd.booking.id IN :bookingIds")
    List<BookingDetail> findByBookingIds(@Param("bookingIds") List<Integer> bookingIds);

    @Query("SELECT bd FROM BookingDetail bd WHERE bd.booking.court.id = :courtId AND bd.booking.playDate = :playDate")
    List<BookingDetail> findByCourtIdAndPlayDate(@Param("courtId") Integer courtId, @Param("playDate") LocalDate playDate);

    @Query("SELECT bd FROM BookingDetail bd WHERE bd.booking.playDate = :playDate")
    List<BookingDetail> findAllByPlayDate(@Param("playDate") LocalDate playDate);

    /**
     * Find conflicting bookings for a court on a specific date with given slots
     * Excludes a specific booking ID (for update scenarios)
     */
    @Query("SELECT bd FROM BookingDetail bd WHERE bd.booking.court.id = :courtId " +
           "AND bd.booking.playDate = :playDate " +
           "AND bd.slot.id IN :slotIds " +
           "AND bd.booking.id != :excludeBookingId " +
           "AND bd.booking.status NOT IN ('CANCELLED')")
    List<BookingDetail> findConflictingBookings(
            @Param("courtId") Integer courtId,
            @Param("playDate") LocalDate playDate,
            @Param("slotIds") List<Integer> slotIds,
            @Param("excludeBookingId") Integer excludeBookingId);
}
