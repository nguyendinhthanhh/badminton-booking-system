package com.badminton.booking.repository;

import com.badminton.booking.entity.BadmintonRacket;
import com.badminton.booking.entity.enums.RacketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadmintonRacketRepository extends JpaRepository<BadmintonRacket, Integer> {
    List<BadmintonRacket> findByStatus(RacketStatus status);
    List<BadmintonRacket> findByBrand(String brand);
}
