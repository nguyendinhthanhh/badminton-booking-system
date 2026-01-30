package com.badminton.booking.service;

import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import org.springframework.data.domain.Page;

public interface ProductService {

    ProductResponse createProductInWarehouse(Integer warehouseId, ProductCreateRequest request);

    Page<ProductResponse> getProductsByWarehouse(Integer warehouseId, int page, int size);

    ProductResponse getProductByIdInWarehouse(Integer warehouseId, Integer productId);

    void updateProductInWarehouse(Integer warehouseId, Integer productId, ProductUpdateRequest request);

    void deleteProductInWarehouse(Integer warehouseId, Integer productId);
}
