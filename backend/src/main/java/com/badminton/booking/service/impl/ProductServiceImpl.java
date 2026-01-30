// ...existing code...
package com.badminton.booking.service.impl;

import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import com.badminton.booking.entity.Product;
import com.badminton.booking.entity.Warehouse;
import com.badminton.booking.mapper.ProductMapper;
import com.badminton.booking.repository.ProductRepository;
import com.badminton.booking.repository.WarehouseRepository;
import com.badminton.booking.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ProductMapper productMapper;

    @Override
    public ProductResponse createProductInWarehouse(Integer warehouseId, ProductCreateRequest request) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        Product product = productMapper.toEntity(request);
        product.setWarehouse(warehouse);

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public Page<ProductResponse> getProductsByWarehouse(Integer warehouseId, int page, int size) {
        warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        return productRepository
                .findByWarehouseId(warehouseId, PageRequest.of(page, size))
                .map(productMapper::toResponse);
    }

    @Override
    public ProductResponse getProductByIdInWarehouse(Integer warehouseId, Integer productId) {
        Product product = productRepository
                .findByIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Product not found in warehouse"));

        return productMapper.toResponse(product);
    }

    @Override
    public void updateProductInWarehouse(Integer warehouseId, Integer productId, ProductUpdateRequest request) {
        Product product = productRepository
                .findByIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Product not found in warehouse"));

        productMapper.updateProduct(product, request);
        productRepository.save(product);
    }

    @Override
    public void deleteProductInWarehouse(Integer warehouseId, Integer productId) {
        Product product = productRepository
                .findByIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new RuntimeException("Product not found in warehouse"));

        productRepository.delete(product);
    }
}

