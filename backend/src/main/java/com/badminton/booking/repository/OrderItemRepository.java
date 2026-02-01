package com.badminton.booking.repository;

import com.badminton.booking.entity.OrderItem;
import com.badminton.booking.entity.Order;
import com.badminton.booking.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrder(Order order);
    List<OrderItem> findByProduct(Product product);
}
