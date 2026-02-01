package com.badminton.booking.repository;

import com.badminton.booking.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Integer> {
    Optional<Warehouse> findByName(String name);
}
