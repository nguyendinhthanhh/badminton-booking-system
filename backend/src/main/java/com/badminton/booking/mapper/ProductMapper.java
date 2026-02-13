package com.badminton.booking.mapper;

import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    Product toEntity(ProductCreateRequest dto);

    @Mapping(source = "warehouse.id", target = "warehouseId")
    @Mapping(source = "category.id", target = "categoryId")
    ProductResponse toResponse(Product product);

    void updateProduct(@MappingTarget Product entity, ProductUpdateRequest dto);
}
