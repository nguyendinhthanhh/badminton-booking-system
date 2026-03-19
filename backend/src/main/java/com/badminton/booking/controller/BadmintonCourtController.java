package com.badminton.booking.controller;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.badminton.booking.dto.response.CourtDetailResponse;
import com.badminton.booking.service.BadmintonCourtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Badminton Courts", description = "Endpoints for managing badminton courts")
@RestController
@RequestMapping("/api/courts")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class BadmintonCourtController {

    @Autowired
    private BadmintonCourtService badmintonCourtService;

    @Operation(summary = "Create Badminton Court", description = "Create a new badminton court")
    @PostMapping("/create")
    public ResponseEntity<BadmintonCourtResponse> createCourt(@Valid @RequestBody BadmintonCourtCreateRequest request) {
        BadmintonCourtResponse badmintonCourt = badmintonCourtService.createBadmintonCourt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(badmintonCourt);
    }

    @Operation(summary = "Get Badminton Court by ID", description = "Retrieve details of a specific badminton court by its ID")
    @GetMapping("/findById/{courtId}")
    public ResponseEntity<BadmintonCourtResponse> getCourtById(@PathVariable("courtId") Integer courtId) {
        BadmintonCourtResponse response = badmintonCourtService.getBadmintonCourtById(courtId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get All Badminton Courts", description = "Retrieve a paginated list of all badminton courts")
    @GetMapping("/all")
    public ResponseEntity<Slice<BadmintonCourtResponse>> getAllCourts(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Slice<BadmintonCourtResponse> responses = badmintonCourtService.getAllBadmintonCourts(page, size);

        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "delete Badminton Court by ID", description = "Delete a specific badminton court by its ID")
    @DeleteMapping("/deleteById/{courtId}")
    public ResponseEntity<String> deleteCourtById(@PathVariable("courtId") Integer court) {
        badmintonCourtService.deleteBadmintonCourtById(court);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "update Badminton Court by ID", description = "Update a specific badminton court by its ID")
    @PutMapping("/updateById/{courtId}")
    public ResponseEntity<String> updateCourtById(@PathVariable("courtId") Integer court,
            @Valid @RequestBody BadmintonCourtUpdateRequest request) {
        badmintonCourtService.updateBadmintonCourt(court, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * API MỚI: Lấy chi tiết sân đầy đủ cho trang Chi tiết sân
     * Bao gồm: thông tin sân + bảng giá + slot trống
     * Chỉ cần 1 API thay vì 3 API
     */
    @Operation(summary = "Get Court Detail", description = "Get full court details including prices and available slots. Use this for Court Detail page.")
    @GetMapping("/{courtId}/detail")
    public ResponseEntity<CourtDetailResponse> getCourtDetail(
            @Parameter(description = "Court ID") @PathVariable Integer courtId,

            @Parameter(description = "Date to check availability (default: today)", example = "2026-02-05") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        CourtDetailResponse response = badmintonCourtService.getCourtDetail(courtId, date);
        return ResponseEntity.ok(response);
    }

    /**
     * Filter courts by price, type, and status
     */
    @Operation(summary = "Filter Courts", description = "Filter courts by price range, type, and status. All filters are optional.")
    @GetMapping("/filter")
    public ResponseEntity<Slice<BadmintonCourtResponse>> filterCourts(
            @Parameter(description = "Minimum price per hour") @RequestParam(required = false) java.math.BigDecimal minPrice,

            @Parameter(description = "Maximum price per hour") @RequestParam(required = false) java.math.BigDecimal maxPrice,

            @Parameter(description = "Court types (SINGLE, DOUBLE, VIP)") @RequestParam(required = false) List<String> types,

            @Parameter(description = "Court status (default: ACTIVE)") @RequestParam(defaultValue = "ACTIVE") String status,

            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Parse court types
        List<com.badminton.booking.entity.enums.CourtType> courtTypes = null;
        if (types != null && !types.isEmpty()) {
            courtTypes = types.stream()
                    .map(com.badminton.booking.entity.enums.CourtType::valueOf)
                    .collect(java.util.stream.Collectors.toList());
        }

        // Parse status
        com.badminton.booking.entity.enums.CourtStatus courtStatus = com.badminton.booking.entity.enums.CourtStatus
                .valueOf(status);

        Slice<BadmintonCourtResponse> responses = badmintonCourtService.filterCourts(
                minPrice, maxPrice, courtTypes, courtStatus, page, size);

        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/courts/available?date=2026-03-20&startTime=08:00&endTime=10:00
     *
     * Returns all ACTIVE courts that have NO booking overlapping the requested slot.
     * <p>
     * Query parameters:
     * - date      (required) – ISO date, e.g. 2026-03-20
     * - startTime (required) – ISO local time, e.g. 08:00
     * - endTime   (required) – ISO local time, e.g. 10:00
     */
    @Operation(
            summary = "Get Available Courts",
            description = "Returns all active courts that are NOT booked for the given date and time window.")
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCourts(
            @Parameter(description = "Play date (yyyy-MM-dd)", example = "2026-03-20", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,

            @Parameter(description = "Desired start time (HH:mm)", example = "08:00", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) java.time.LocalTime startTime,

            @Parameter(description = "Desired end time (HH:mm)", example = "10:00", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) java.time.LocalTime endTime) {

        // ── Basic input validation ────────────────────────────────────────────
        if (date == null || startTime == null || endTime == null) {
            return ResponseEntity
                    .badRequest()
                    .body("date, startTime and endTime are all required.");
        }
        if (!endTime.isAfter(startTime)) {
            return ResponseEntity
                    .badRequest()
                    .body("endTime must be strictly after startTime.");
        }

        List<com.badminton.booking.dto.response.BadmintonCourtResponse> available =
                badmintonCourtService.getAvailableCourts(date, startTime, endTime);

        return ResponseEntity.ok(available);
    }
}
