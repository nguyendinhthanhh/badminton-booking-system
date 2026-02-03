package com.badminton.booking.controller;

import com.badminton.booking.dto.request.TimeSlotRequest;
import com.badminton.booking.dto.response.TimeSlotResponse;
import com.badminton.booking.service.TimeSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-slots")
@RequiredArgsConstructor
@Tag(name = "Time Slot", description = "API quản lý khung giờ đặt sân")
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo khung giờ mới")
    public ResponseEntity<TimeSlotResponse> createTimeSlot(@Valid @RequestBody TimeSlotRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeSlotService.createTimeSlot(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật khung giờ")
    public ResponseEntity<TimeSlotResponse> updateTimeSlot(
            @PathVariable Integer id,
            @Valid @RequestBody TimeSlotRequest request) {
        return ResponseEntity.ok(timeSlotService.updateTimeSlot(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa khung giờ")
    public ResponseEntity<Void> deleteTimeSlot(@PathVariable Integer id) {
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin khung giờ theo ID")
    public ResponseEntity<TimeSlotResponse> getTimeSlotById(@PathVariable Integer id) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotById(id));
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả khung giờ")
    public ResponseEntity<List<TimeSlotResponse>> getAllTimeSlots() {
        return ResponseEntity.ok(timeSlotService.getAllTimeSlots());
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy các khung giờ đang hoạt động")
    public ResponseEntity<List<TimeSlotResponse>> getActiveTimeSlots() {
        return ResponseEntity.ok(timeSlotService.getActiveTimeSlots());
    }

    @PostMapping("/init-default")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo các khung giờ mặc định (6h-22h với hệ số giá)")
    public ResponseEntity<List<TimeSlotResponse>> createDefaultTimeSlots() {
        return ResponseEntity.status(HttpStatus.CREATED).body(timeSlotService.createDefaultTimeSlots());
    }
}
