package com.badminton.booking.service;

import com.badminton.booking.dto.report.AdminDashboardReportResponse;

import java.time.LocalDate;

public interface AdminReportService {
    AdminDashboardReportResponse getDashboardReport(String reportType, LocalDate fromDate, LocalDate toDate);
}
