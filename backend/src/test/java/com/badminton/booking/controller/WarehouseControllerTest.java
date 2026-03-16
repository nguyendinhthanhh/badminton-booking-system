package com.badminton.booking.controller;

import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.security.JwtAuthenticationFilter;
import com.badminton.booking.service.ProductService;
import com.badminton.booking.repository.WarehouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.times;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(
        controllers = WarehouseController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
public class WarehouseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @MockBean
    private WarehouseRepository warehouseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
    }

    @Test
    public void whenGetProductsWithoutAuth_thenOk() throws Exception {
        ProductResponse p = new ProductResponse();
        p.setId(1);
        p.setName("Test");
        Page<ProductResponse> page = new PageImpl<>(List.of(p), PageRequest.of(0,20), 1);
        Mockito.when(productService.getProductsByWarehouse(anyInt(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/warehouses/1/products").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = {"STAFF"})
    public void whenPostProductWithStaffAuth_thenCreated() throws Exception {
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("Name");
        req.setBasePrice(new BigDecimal("100"));

        ProductResponse resp = new ProductResponse();
        resp.setId(2);
        resp.setName("Name");

        Mockito.when(productService.createProductInWarehouse(anyInt(), any(ProductCreateRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/warehouses/1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        Mockito.verify(productService, times(1)).createProductInWarehouse(anyInt(), any(ProductCreateRequest.class));
    }
}
