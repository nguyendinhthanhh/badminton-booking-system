package com.badminton.booking.controller;

import com.badminton.booking.dto.report.AdminDashboardReportResponse;
import com.badminton.booking.service.AdminReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin Reports", description = "Admin reporting APIs")
public class AdminReportController {
    private final AdminReportService adminReportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard report by type and date range")
    public ResponseEntity<AdminDashboardReportResponse> getDashboardReport(
            @RequestParam(defaultValue = "overview") String reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(adminReportService.getDashboardReport(reportType, fromDate, toDate));
    }
}
