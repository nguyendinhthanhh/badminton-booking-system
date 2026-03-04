package com.badminton.booking.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Products", description = "Endpoints for products in warehouses")
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ProductController {
    // Warehouse-specific product endpoints were consolidated into `WarehouseController`.
    // Keep this controller as a placeholder for future global product APIs (search, admin views, etc.).
}
