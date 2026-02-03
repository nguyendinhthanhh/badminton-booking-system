package com.badminton.booking.controller;

import com.badminton.booking.dto.request.CourtPriceRequest;
import com.badminton.booking.dto.response.CourtPriceResponse;
import com.badminton.booking.entity.enums.DayType;
import com.badminton.booking.service.CourtPriceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/court-prices")
@RequiredArgsConstructor
@Tag(name = "Court Price", description = "API quản lý giá sân theo khung giờ và loại ngày")
public class CourtPriceController {

    private final CourtPriceService courtPriceService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo giá mới cho sân")
    public ResponseEntity<CourtPriceResponse> createPrice(@Valid @RequestBody CourtPriceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courtPriceService.createPrice(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật giá sân")
    public ResponseEntity<CourtPriceResponse> updatePrice(
            @PathVariable Integer id,
            @Valid @RequestBody CourtPriceRequest request) {
        return ResponseEntity.ok(courtPriceService.updatePrice(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa giá sân")
    public ResponseEntity<Void> deletePrice(@PathVariable Integer id) {
        courtPriceService.deletePrice(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin giá theo ID")
    public ResponseEntity<CourtPriceResponse> getPriceById(@PathVariable Integer id) {
        return ResponseEntity.ok(courtPriceService.getPriceById(id));
    }

    @GetMapping("/court/{courtId}")
    @Operation(summary = "Lấy tất cả giá của một sân")
    public ResponseEntity<List<CourtPriceResponse>> getPricesByCourtId(@PathVariable Integer courtId) {
        return ResponseEntity.ok(courtPriceService.getPricesByCourtId(courtId));
    }

    @GetMapping("/court/{courtId}/day-type/{dayType}")
    @Operation(summary = "Lấy giá của sân theo loại ngày (WEEKDAY/WEEKEND)")
    public ResponseEntity<List<CourtPriceResponse>> getPricesByCourtIdAndDayType(
            @PathVariable Integer courtId,
            @PathVariable DayType dayType) {
        return ResponseEntity.ok(courtPriceService.getPricesByCourtIdAndDayType(courtId, dayType));
    }

    @GetMapping("/calculate")
    @Operation(summary = "Tính giá cho sân tại thời điểm cụ thể")
    public ResponseEntity<Map<String, Object>> calculatePrice(
            @RequestParam Integer courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time) {

        BigDecimal price = courtPriceService.getPriceForTime(courtId, date, time);

        return ResponseEntity.ok(Map.of(
                "courtId", courtId,
                "date", date,
                "time", time,
                "dayType", getDayType(date),
                "pricePerHour", price != null ? price : "Chưa cấu hình giá"
        ));
    }

    @PostMapping("/court/{courtId}/init-default")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo bảng giá mặc định cho sân (WEEKDAY + WEEKEND)")
    public ResponseEntity<List<CourtPriceResponse>> createDefaultPrices(@PathVariable Integer courtId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courtPriceService.createDefaultPricesForCourt(courtId));
    }

    private String getDayType(LocalDate date) {
        java.time.DayOfWeek day = date.getDayOfWeek();
        if (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY) {
            return "WEEKEND";
        }
        return "WEEKDAY";
    }
}

