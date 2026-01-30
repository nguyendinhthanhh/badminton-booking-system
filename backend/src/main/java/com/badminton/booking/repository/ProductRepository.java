package com.badminton.booking.repository;

import com.badminton.booking.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    Page<Product> findByWarehouseId(Integer warehouseId, Pageable pageable);

    Optional<Product> findByIdAndWarehouseId(Integer id, Integer warehouseId);
}
