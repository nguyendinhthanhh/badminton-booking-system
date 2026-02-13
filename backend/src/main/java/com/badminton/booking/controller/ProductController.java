package com.badminton.booking.controller;

import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Products", description = "Endpoints for products in warehouses")
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Operation(summary = "List products by warehouse")
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<Page<ProductResponse>> listByWarehouse(
            @PathVariable Integer warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ProductResponse> responses = productService.getProductsByWarehouse(warehouseId, page, size);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Create product in warehouse")
    @PostMapping("/warehouse/{warehouseId}")
    public ResponseEntity<ProductResponse> create(
            @PathVariable Integer warehouseId,
            @Valid @RequestBody ProductCreateRequest request) {

        ProductResponse response = productService.createProductInWarehouse(warehouseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update product in warehouse")
    @PutMapping("/warehouse/{warehouseId}/{productId}")
    public ResponseEntity<Void> update(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId,
            @Valid @RequestBody ProductUpdateRequest request) {

        productService.updateProductInWarehouse(warehouseId, productId, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete product in warehouse")
    @DeleteMapping("/warehouse/{warehouseId}/{productId}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId) {

        productService.deleteProductInWarehouse(warehouseId, productId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List shuttlecocks by warehouse")
    @GetMapping("/warehouse/{warehouseId}/shuttlecocks")
    public ResponseEntity<Page<ProductResponse>> listShuttlecocks(
            @PathVariable Integer warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ProductResponse> responses = productService.getShuttlecocksByWarehouse(warehouseId, page, size);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "Create shuttlecock in warehouse")
    @PostMapping("/warehouse/{warehouseId}/shuttlecocks")
    public ResponseEntity<ProductResponse> createShuttlecock(
            @PathVariable Integer warehouseId,
            @Valid @RequestBody ProductCreateRequest request) {

        ProductResponse response = productService.createShuttlecockInWarehouse(warehouseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update shuttlecock in warehouse")
    @PutMapping("/warehouse/{warehouseId}/shuttlecocks/{productId}")
    public ResponseEntity<Void> updateShuttlecock(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId,
            @Valid @RequestBody ProductUpdateRequest request) {

        productService.updateShuttlecockInWarehouse(warehouseId, productId, request);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete shuttlecock in warehouse")
    @DeleteMapping("/warehouse/{warehouseId}/shuttlecocks/{productId}")
    public ResponseEntity<Void> deleteShuttlecock(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId) {

        productService.deleteShuttlecockInWarehouse(warehouseId, productId);
        return ResponseEntity.noContent().build();
    }
}
