package com.badminton.booking.repository;

import com.badminton.booking.entity.PriceRule;
import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PriceRuleRepository extends JpaRepository<PriceRule, Integer> {
    Optional<PriceRule> findByCourtAndSlot(BadmintonCourt court, TimeSlot slot);
    List<PriceRule> findByCourt(BadmintonCourt court);
}
