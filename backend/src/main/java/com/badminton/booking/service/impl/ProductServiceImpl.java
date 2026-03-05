// ...existing code...
package com.badminton.booking.service.impl;

import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import com.badminton.booking.entity.Category;
import com.badminton.booking.entity.Product;
import com.badminton.booking.entity.Warehouse;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.mapper.ProductMapper;
import com.badminton.booking.repository.CategoryRepository;
import com.badminton.booking.repository.ProductRepository;
import com.badminton.booking.repository.WarehouseRepository;
import com.badminton.booking.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductServiceImpl implements ProductService {
    private static final String SHUTTLECOCK_CATEGORY = "Shuttlecocks";
    private volatile Integer shuttlecockCategoryId;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductMapper productMapper;

    @Override
    public ProductResponse createProductInWarehouse(Integer warehouseId, ProductCreateRequest request) {
        // ensure warehouse exists
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));

        Product product = productMapper.toEntity(request);
        product.setWarehouse(warehouse);
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByWarehouse(Integer warehouseId, int page, int size) {
        return productRepository
                .findByWarehouseId(warehouseId, PageRequest.of(page, size))
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductByIdInWarehouse(Integer warehouseId, Integer productId) {
        Product product = productRepository
                .findByIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in warehouse"));

        return productMapper.toResponse(product);
    }

    @Override
    public void updateProductInWarehouse(Integer warehouseId, Integer productId, ProductUpdateRequest request) {
        Product product = productRepository
                .findByIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in warehouse"));

        productMapper.updateProduct(product, request);
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }
        productRepository.save(product);
    }

    @Override
    public void deleteProductInWarehouse(Integer warehouseId, Integer productId) {
        Product product = productRepository
                .findByIdAndWarehouseId(productId, warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in warehouse"));

        productRepository.delete(product);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getShuttlecocksByWarehouse(Integer warehouseId, int page, int size) {
        Integer categoryId = getShuttlecockCategoryId();
        return productRepository
                .findShuttlecockViewsByWarehouseAndCategoryId(warehouseId, categoryId, PageRequest.of(page, size))
                .map(this::toProductResponse);
    }

    @Override
    public ProductResponse createShuttlecockInWarehouse(Integer warehouseId, ProductCreateRequest request) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found"));
        Category category = categoryRepository.findById(getShuttlecockCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Shuttlecock category not found"));

        Product product = productMapper.toEntity(request);
        product.setWarehouse(warehouse);
        product.setCategory(category);

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void updateShuttlecockInWarehouse(Integer warehouseId, Integer productId, ProductUpdateRequest request) {
        Integer categoryId = getShuttlecockCategoryId();
        Product product = productRepository
                .findByIdAndWarehouseIdAndCategoryId(productId, warehouseId, categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttlecock not found in warehouse"));

        productMapper.updateProduct(product, request);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteShuttlecockInWarehouse(Integer warehouseId, Integer productId) {
        Integer categoryId = getShuttlecockCategoryId();
        Product product = productRepository
                .findByIdAndWarehouseIdAndCategoryId(productId, warehouseId, categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Shuttlecock not found in warehouse"));

        productRepository.delete(product);
    }

    private Integer getShuttlecockCategoryId() {
        Integer cached = shuttlecockCategoryId;
        if (cached != null) {
            return cached;
        }
        synchronized (this) {
            if (shuttlecockCategoryId == null) {
                shuttlecockCategoryId = categoryRepository.findByName(SHUTTLECOCK_CATEGORY)
                        .map(Category::getId)
                        .orElseThrow(() -> new ResourceNotFoundException("Shuttlecock category not found"));
            }
            return shuttlecockCategoryId;
        }
    }

    private ProductResponse toProductResponse(ProductRepository.ShuttlecockListView view) {
        ProductResponse response = new ProductResponse();
        response.setId(view.getId());
        response.setName(view.getName());
        response.setSku(view.getSku());
        response.setDescription(view.getDescription());
        response.setBasePrice(view.getBasePrice());
        response.setQuantity(view.getQuantity());
        response.setWarehouseId(view.getWarehouseId());
        response.setCategoryId(view.getCategoryId());
        return response;
    }
}
