package com.badminton.booking.controller;

import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import com.badminton.booking.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Products", description = "Endpoints for products in warehouses")
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    // ─── Shuttlecock endpoints (frontend path: /api/products/warehouse/{warehouseId}/shuttlecocks) ───

    @Operation(summary = "List shuttlecocks by warehouse")
    @GetMapping("/warehouse/{warehouseId}/shuttlecocks")
    public ResponseEntity<Page<ProductResponse>> listShuttlecocks(
            @PathVariable Integer warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(productService.getShuttlecocksByWarehouse(warehouseId, page, size));
    }

    @Operation(summary = "Create shuttlecock in warehouse")
    @PostMapping("/warehouse/{warehouseId}/shuttlecocks")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ProductResponse> createShuttlecock(
            @PathVariable Integer warehouseId,
            @Valid @RequestBody ProductCreateRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createShuttlecockInWarehouse(warehouseId, request));
    }

    @Operation(summary = "Update shuttlecock in warehouse")
    @PutMapping("/warehouse/{warehouseId}/shuttlecocks/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ProductResponse> updateShuttlecock(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId,
            @Valid @RequestBody ProductUpdateRequest request) {

        productService.updateShuttlecockInWarehouse(warehouseId, productId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Delete shuttlecock in warehouse")
    @DeleteMapping("/warehouse/{warehouseId}/shuttlecocks/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Void> deleteShuttlecock(
            @PathVariable Integer warehouseId,
            @PathVariable Integer productId) {

        productService.deleteShuttlecockInWarehouse(warehouseId, productId);
        return ResponseEntity.noContent().build();
    }
}
