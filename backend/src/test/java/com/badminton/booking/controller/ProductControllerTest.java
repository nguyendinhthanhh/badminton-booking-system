package com.badminton.booking.controller;

import com.badminton.booking.dto.product.ProductResponse;
import com.badminton.booking.dto.request.ProductCreateRequest;
import com.badminton.booking.dto.request.ProductUpdateRequest;
import com.badminton.booking.security.JwtAuthenticationFilter;
import com.badminton.booking.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for ProductController — covers all 5 shuttlecock API endpoints
 * required by the frontend under /api/products/warehouse/{warehouseId}/shuttlecocks
 */
@WebMvcTest(
        controllers = ProductController.class,
        excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class},
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
)
@AutoConfigureMockMvc(addFilters = false)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;

    // ─── Helper factory ───────────────────────────────────────────────────────

    private ProductResponse buildProductResponse(int id, String name) {
        ProductResponse r = new ProductResponse();
        r.setId(id);
        r.setName(name);
        r.setSku("SKU-" + id);
        r.setBasePrice(new BigDecimal("150000"));
        r.setQuantity(50);
        r.setWarehouseId(1);
        return r;
    }

    // ─── GET /api/products/warehouse/{warehouseId}/shuttlecocks ──────────────

    @Test
    public void listShuttlecocks_withoutAuth_returnsOkAndPage() throws Exception {
        ProductResponse p = buildProductResponse(1, "YONEX AS-50");
        Page<ProductResponse> page = new PageImpl<>(List.of(p), PageRequest.of(0, 10), 1);

        Mockito.when(productService.getShuttlecocksByWarehouse(1, 0, 10)).thenReturn(page);

        mockMvc.perform(get("/api/products/warehouse/1/shuttlecocks")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value("YONEX AS-50"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    public void listShuttlecocks_defaultPagination_usesDefaultPageSize() throws Exception {
        Page<ProductResponse> emptyPage = new PageImpl<>(List.of(), PageRequest.of(0, 10), 0);
        Mockito.when(productService.getShuttlecocksByWarehouse(anyInt(), anyInt(), anyInt()))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/api/products/warehouse/2/shuttlecocks")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(productService, times(1)).getShuttlecocksByWarehouse(2, 0, 10);
    }

    // ─── POST /api/products/warehouse/{warehouseId}/shuttlecocks ─────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    public void createShuttlecock_withAdminRole_returnsCreated() throws Exception {
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("Victor Gold No.1");
        req.setSku("VG1");
        req.setBasePrice(new BigDecimal("320000"));
        req.setQuantity(80);
        req.setDescription("Premium shuttlecocks");

        ProductResponse resp = buildProductResponse(10, "Victor Gold No.1");
        Mockito.when(productService.createShuttlecockInWarehouse(eq(1), any(ProductCreateRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(post("/api/products/warehouse/1/shuttlecocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Victor Gold No.1"));

        verify(productService, times(1))
                .createShuttlecockInWarehouse(eq(1), any(ProductCreateRequest.class));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    public void createShuttlecock_withStaffRole_returnsCreated() throws Exception {
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("RSL Classic");
        req.setBasePrice(new BigDecimal("200000"));
        req.setQuantity(60);

        ProductResponse resp = buildProductResponse(11, "RSL Classic");
        Mockito.when(productService.createShuttlecockInWarehouse(anyInt(), any(ProductCreateRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(post("/api/products/warehouse/1/shuttlecocks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    // ─── PUT /api/products/warehouse/{warehouseId}/shuttlecocks/{productId} ──

    @Test
    @WithMockUser(roles = "ADMIN")
    public void updateShuttlecock_withAdminRole_returnsOk() throws Exception {
        ProductUpdateRequest req = new ProductUpdateRequest();
        req.setName("YONEX AS-50 Updated");
        req.setBasePrice(new BigDecimal("290000"));
        req.setQuantity(95);

        Mockito.doNothing().when(productService)
                .updateShuttlecockInWarehouse(eq(1), eq(5), any(ProductUpdateRequest.class));

        mockMvc.perform(put("/api/products/warehouse/1/shuttlecocks/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(productService, times(1))
                .updateShuttlecockInWarehouse(eq(1), eq(5), any(ProductUpdateRequest.class));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    public void updateShuttlecock_withStaffRole_returnsOk() throws Exception {
        ProductUpdateRequest req = new ProductUpdateRequest();
        req.setQuantity(100);

        Mockito.doNothing().when(productService)
                .updateShuttlecockInWarehouse(anyInt(), anyInt(), any(ProductUpdateRequest.class));

        mockMvc.perform(put("/api/products/warehouse/2/shuttlecocks/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ─── DELETE /api/products/warehouse/{warehouseId}/shuttlecocks/{productId}

    @Test
    @WithMockUser(roles = "ADMIN")
    public void deleteShuttlecock_withAdminRole_returnsNoContent() throws Exception {
        Mockito.doNothing().when(productService)
                .deleteShuttlecockInWarehouse(eq(1), eq(5));

        mockMvc.perform(delete("/api/products/warehouse/1/shuttlecocks/5"))
                .andExpect(status().isNoContent());

        verify(productService, times(1)).deleteShuttlecockInWarehouse(1, 5);
    }

    @Test
    @WithMockUser(roles = "STAFF")
    public void deleteShuttlecock_withStaffRole_returnsNoContent() throws Exception {
        Mockito.doNothing().when(productService)
                .deleteShuttlecockInWarehouse(anyInt(), anyInt());

        mockMvc.perform(delete("/api/products/warehouse/2/shuttlecocks/8"))
                .andExpect(status().isNoContent());
    }
}
