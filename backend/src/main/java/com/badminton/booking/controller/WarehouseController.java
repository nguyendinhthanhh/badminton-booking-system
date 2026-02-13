package com.badminton.booking.controller;

import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import com.badminton.booking.dto.response.WarehouseOptionResponse;
import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.repository.WarehouseRepository;
import com.badminton.booking.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Warehouses", description = "Endpoints for warehouse products")
@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class WarehouseController {

    @Autowired
    private ProductService productService;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Operation(summary = "Get all warehouses")
    @GetMapping
    public ResponseEntity<List<WarehouseOptionResponse>> getWarehouses() {
        List<WarehouseOptionResponse> warehouses = warehouseRepository.findAll().stream()
                .map(warehouse -> new WarehouseOptionResponse(
                        warehouse.getId(),
                        warehouse.getName(),
                        warehouse.getAddress()))
                .toList();
        return ResponseEntity.ok(warehouses);
    }

    @Operation(summary = "Get products by warehouse")
    @GetMapping("/{warehouseId}/products")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @PathVariable Integer warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                productService.getProductsByWarehouse(warehouseId, page, size)
        );
    }

    @Operation(summary = "Create product in warehouse")
    @PostMapping("/{warehouseId}/products")
    public ResponseEntity<ProductResponse> createProduct(
            @PathVariable Integer warehouseId,
            @Valid @RequestBody ProductCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProductInWarehouse(warehouseId, request));
    }

    @Operation(summary = "Update product in warehouse")
    @PutMapping("/{warehouseId}/products/{productId}")
    public ResponseEntity<Void> updateProduct(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId,
            @Valid @RequestBody ProductUpdateRequest request) {

        productService.updateProductInWarehouse(warehouseId, productId, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete product in warehouse")
    @DeleteMapping("/{warehouseId}/products/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId) {

        productService.deleteProductInWarehouse(warehouseId, productId);
        return ResponseEntity.noContent().build();
    }
}
