package com.badminton.booking.repository;

import com.badminton.booking.entity.Review;
import com.badminton.booking.entity.User;
import com.badminton.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByUser(User user);
    List<Review> findByBooking(Booking booking);
    List<Review> findByRating(Integer rating);
    List<Review> findByRatingGreaterThanEqual(Integer rating);
}
