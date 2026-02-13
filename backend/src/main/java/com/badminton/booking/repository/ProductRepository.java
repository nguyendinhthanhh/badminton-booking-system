package com.badminton.booking.repository;

import com.badminton.booking.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    interface ShuttlecockListView {
        Integer getId();
        String getName();
        String getSku();
        String getDescription();
        java.math.BigDecimal getBasePrice();
        Integer getQuantity();
        Integer getWarehouseId();
        Integer getCategoryId();
    }

    Page<Product> findByWarehouseId(Integer warehouseId, Pageable pageable);

    Optional<Product> findByIdAndWarehouseId(Integer id, Integer warehouseId);

    Page<Product> findByWarehouseIdAndCategory_NameIgnoreCase(Integer warehouseId, String categoryName, Pageable pageable);

    Optional<Product> findByIdAndWarehouseIdAndCategory_NameIgnoreCase(Integer id, Integer warehouseId, String categoryName);

    Page<Product> findByWarehouseIdAndCategoryId(Integer warehouseId, Integer categoryId, Pageable pageable);

    Optional<Product> findByIdAndWarehouseIdAndCategoryId(Integer id, Integer warehouseId, Integer categoryId);

    @Query("""
            select
                p.id as id,
                p.name as name,
                p.sku as sku,
                p.description as description,
                p.basePrice as basePrice,
                p.quantity as quantity,
                p.warehouse.id as warehouseId,
                p.category.id as categoryId
            from Product p
            where p.warehouse.id = :warehouseId and p.category.id = :categoryId
            """)
    Page<ShuttlecockListView> findShuttlecockViewsByWarehouseAndCategoryId(
            @Param("warehouseId") Integer warehouseId,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);
}
