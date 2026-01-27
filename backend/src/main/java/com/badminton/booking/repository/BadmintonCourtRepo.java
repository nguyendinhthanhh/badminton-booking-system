package com.badminton.booking.repository;

import com.badminton.booking.entity.BadmintonCourt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadmintonCourtRepo extends JpaRepository<BadmintonCourt, Integer> {
}
