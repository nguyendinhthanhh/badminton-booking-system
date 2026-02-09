package com.badminton.booking.service.impl;

import com.badminton.booking.dto.booking.*;
import com.badminton.booking.entity.*;
import com.badminton.booking.entity.enums.DayType;
import com.badminton.booking.exception.ResourceNotFoundException;
import com.badminton.booking.repository.*;
import com.badminton.booking.service.BookingService;
import com.badminton.booking.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BadmintonCourtRepo courtRepository;
    private final CourtPriceRepository courtPriceRepository;
    private final UserRepository userRepository;
    private final ReleasedSlotRepository releasedSlotRepository;
    private final SystemConfigService systemConfigService;

    // ===== CONSTANTS =====
    private static final int DEFAULT_BUFFER_MINUTES = 10;
    private static final BigDecimal OVERTIME_RATE_MULTIPLIER = new BigDecimal("1.5");
    private static final int MAX_OVERTIME_MINUTES = 30;
    private static final int MIN_BOOKING_DURATION = 30; // 30 phút - giảm từ 60 phút
    private static final int DEFAULT_OPEN_ENDED_DURATION = 120; // 2 giờ mặc định cho estimated duration
    private static final int DEFAULT_MAX_DURATION = 240; // 4 giờ mặc định cho max duration (soft-block)
    private static final LocalTime DEFAULT_OPERATING_START = LocalTime.of(5, 0); // Mở từ 5h sáng
    private static final LocalTime DEFAULT_OPERATING_END = LocalTime.of(23, 0); // Đóng lúc 23h đêm

    // ===== STATUS CONSTANTS =====
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_CONFIRMED = "CONFIRMED";
    private static final String STATUS_PLAYING = "PLAYING";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_CANCELLATION_REQUESTED = "CANCELLATION_REQUESTED";

    // ========================================================
    // 1. CHECK OVERLAP - Core function
    // Công thức: (start < existingEnd + buffer) && (end > existingStart)
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(Integer courtId, LocalDate playDate,
            LocalTime startTime, LocalTime endTime) {
        // Validate inputs
        validateTimeRange(startTime, endTime);

        BadmintonCourt court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found: " + courtId));

        // Lấy tất cả booking active của sân trong ngày
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByCourtAndDate(
                courtId, playDate, null);

        // Check overlap với từng booking (hard block)
        List<AvailabilityResponse.ConflictingBooking> conflicts = new ArrayList<>();

        // Check soft-block từ walk-in open-ended bookings
        List<AvailabilityResponse.SoftBlockInfo> softBlockInfos = new ArrayList<>();
        boolean isSoftBlocked = false;

        for (Booking existing : activeBookings) {
            // Hard block check - dựa trên estimated end time
            if (isOverlapping(startTime, endTime, existing)) {
                conflicts.add(AvailabilityResponse.ConflictingBooking.builder()
                        .bookingId(existing.getId())
                        .startTime(existing.getStartTime())
                        .endTime(existing.getEndTime())
                        .effectiveEndTime(existing.getEffectiveEndTime())
                        .status(existing.getStatus())
                        .openEnded(existing.getOpenEnded())
                        .build());
            }
            // Soft block check - cho walk-in open-ended đang PLAYING
            else if (isSoftBlockedBy(startTime, endTime, existing)) {
                isSoftBlocked = true;
                LocalTime estEnd = getEstimatedEndTime(existing);
                LocalTime maxEnd = getMaxEndTime(existing);

                softBlockInfos.add(AvailabilityResponse.SoftBlockInfo.builder()
                        .bookingId(existing.getId())
                        .walkInStartTime(existing.getStartTime())
                        .estimatedEndTime(estEnd)
                        .maxEndTime(maxEnd)
                        .guestName(existing.getGuestName() != null ? existing.getGuestName()
                                : (existing.getUser() != null ? existing.getUser().getFullName() : "Khách"))
                        .message("Khách walk-in đang chơi từ " + existing.getStartTime() +
                                ", dự kiến kết thúc lúc " + estEnd +
                                ", có thể kéo dài đến " + maxEnd)
                        .build());
            }
        }

        boolean available = conflicts.isEmpty();

        // Nếu không available, gợi ý các slot trống
        List<AvailabilityResponse.AvailableSlot> suggestions = available ? Collections.emptyList()
                : findAvailableSlots(courtId, playDate, activeBookings);

        // Build message
        String message;
        if (!available) {
            message = "Khung giờ đã có người đặt, vui lòng chọn giờ khác";
        } else if (isSoftBlocked) {
            message = "Khung giờ có thể bị ảnh hưởng bởi khách walk-in đang chơi. Bạn vẫn có thể đặt nhưng có rủi ro bị delay.";
        } else {
            message = "Khung giờ trống, có thể đặt sân";
        }

        String softBlockWarning = isSoftBlocked
                ? "⚠️ Cảnh báo: Có khách walk-in đang chơi trước slot của bạn và chưa xác định giờ kết thúc. " +
                        "Nếu họ chơi quá giờ dự kiến, bạn có thể phải chờ hoặc đổi sân."
                : null;

        return AvailabilityResponse.builder()
                .courtId(courtId)
                .courtName(court.getName())
                .date(playDate)
                .requestedStart(startTime)
                .requestedEnd(endTime)
                .available(available)
                .softBlocked(isSoftBlocked)
                .softBlockWarning(softBlockWarning)
                .softBlockedBy(softBlockInfos.isEmpty() ? null : softBlockInfos)
                .message(message)
                .conflicts(conflicts)
                .suggestedSlots(suggestions)
                .build();
    }

    /**
     * Core overlap check: (start < existingEnd + buffer) && (end > existingStart)
     * Dùng estimatedEndTime cho open-ended bookings
     */
    private boolean isOverlapping(LocalTime newStart, LocalTime newEnd, Booking existing) {
        LocalTime existingStart = existing.getStartTime();
        LocalTime existingEffectiveEnd = existing.getEffectiveEndTime(); // endTime + buffer (hoặc estimated + buffer)

        // If existing booking has missing times, treat it as non-overlapping
        if (existingStart == null || existingEffectiveEnd == null) {
            return false;
        }

        // Overlap formula: (start < existingEnd) && (end > existingStart)
        return newStart.isBefore(existingEffectiveEnd) && newEnd.isAfter(existingStart);
    }

    /**
     * Check if slot is soft-blocked by a walk-in open-ended booking
     * Soft-block zone: từ estimatedEndTime đến maxEndTime
     */
    private boolean isSoftBlockedBy(LocalTime newStart, LocalTime newEnd, Booking existing) {
        // Chỉ soft-block nếu là walk-in, open-ended, và đang PLAYING
        if (!Boolean.TRUE.equals(existing.getOpenEnded())) {
            return false;
        }
        if (!STATUS_PLAYING.equals(existing.getStatus())) {
            return false;
        }

        LocalTime estimatedEnd = getEstimatedEndTime(existing);
        LocalTime maxEnd = getMaxEndTime(existing);

        if (estimatedEnd == null || maxEnd == null) {
            return false;
        }

        // Soft-block zone: [estimatedEnd, maxEnd]
        // Check if newStart falls within soft-block zone
        // newStart >= estimatedEnd && newStart < maxEnd
        boolean startsInSoftZone = !newStart.isBefore(estimatedEnd) && newStart.isBefore(maxEnd);

        return startsInSoftZone;
    }

    /**
     * Lấy estimated end time của booking
     */
    private LocalTime getEstimatedEndTime(Booking booking) {
        if (booking.getEndTime() != null) {
            return booking.getEndTime();
        }
        if (booking.getEstimatedDurationMinutes() != null && booking.getStartTime() != null) {
            return booking.getStartTime().plusMinutes(booking.getEstimatedDurationMinutes());
        }
        // Default: startTime + 2 tiếng
        if (booking.getStartTime() != null) {
            return booking.getStartTime().plusMinutes(DEFAULT_OPEN_ENDED_DURATION);
        }
        return null;
    }

    /**
     * Lấy max end time của booking (cho soft-block)
     */
    private LocalTime getMaxEndTime(Booking booking) {
        if (booking.getMaxDurationMinutes() != null && booking.getStartTime() != null) {
            LocalTime maxByDuration = booking.getStartTime().plusMinutes(booking.getMaxDurationMinutes());
            LocalTime operatingEnd = systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);
            return maxByDuration.isAfter(operatingEnd) ? operatingEnd : maxByDuration;
        }
        // Default: startTime + 4 tiếng hoặc giờ đóng cửa
        if (booking.getStartTime() != null) {
            LocalTime operatingEnd = systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);
            LocalTime maxByDefault = booking.getStartTime().plusMinutes(DEFAULT_MAX_DURATION);
            return maxByDefault.isAfter(operatingEnd) ? operatingEnd : maxByDefault;
        }
        return systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);
    }

    // ========================================================
    // 2. CALCULATE PRICE - Tách theo nhiều khung giá
    // Ví dụ: 07:00-10:00 = 60k + 80k*2 = 220k
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public PriceCalculationResponse calculatePrice(Integer courtId, LocalDate playDate,
            LocalTime startTime, LocalTime endTime) {
        validateTimeRange(startTime, endTime);

        BadmintonCourt court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found: " + courtId));

        DayType dayType = getDayType(playDate);

        // Lấy tất cả khung giá của sân theo loại ngày
        List<CourtPrice> prices = courtPriceRepository.findByCourtIdAndDayType(courtId, dayType);

        if (prices.isEmpty()) {
            throw new RuntimeException("Chưa cấu hình giá cho sân " + court.getName() + " vào " + dayType);
        }

        // Sort theo startTime
        prices.sort(Comparator.comparing(CourtPrice::getStartTime));

        // Tính giá từng segment
        List<PriceCalculationResponse.PriceSegment> breakdown = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;
        LocalTime currentTime = startTime;

        while (currentTime.isBefore(endTime)) {
            // Tìm khung giá phù hợp cho currentTime
            CourtPrice applicablePrice = findApplicablePrice(prices, currentTime);

            if (applicablePrice == null) {
                throw new RuntimeException("Không tìm thấy giá cho khung giờ " + currentTime);
            }

            // Xác định segment end: min(endTime, priceEndTime)
            LocalTime segmentEnd = endTime.isBefore(applicablePrice.getEndTime()) ? endTime
                    : applicablePrice.getEndTime();

            // Tính duration và giá
            int segmentMinutes = (int) Duration.between(currentTime, segmentEnd).toMinutes();
            BigDecimal pricePerHour = applicablePrice.getPricePerHour();
            BigDecimal subtotal = pricePerHour
                    .multiply(BigDecimal.valueOf(segmentMinutes))
                    .divide(BigDecimal.valueOf(60), 0, RoundingMode.HALF_UP);

            breakdown.add(PriceCalculationResponse.PriceSegment.builder()
                    .start(currentTime)
                    .end(segmentEnd)
                    .minutes(segmentMinutes)
                    .pricePerHour(pricePerHour)
                    .subtotal(subtotal)
                    .periodName(getPeriodName(currentTime))
                    .build());

            totalPrice = totalPrice.add(subtotal);
            currentTime = segmentEnd;
        }

        int totalMinutes = (int) Duration.between(startTime, endTime).toMinutes();

        return PriceCalculationResponse.builder()
                .courtId(courtId)
                .courtName(court.getName())
                .playDate(playDate)
                .dayType(dayType.name())
                .startTime(startTime)
                .endTime(endTime)
                .totalMinutes(totalMinutes)
                .totalPrice(totalPrice)
                .breakdown(breakdown)
                .build();
    }

    private CourtPrice findApplicablePrice(List<CourtPrice> prices, LocalTime time) {
        for (CourtPrice price : prices) {
            // time >= startTime && time < endTime
            if (!time.isBefore(price.getStartTime()) && time.isBefore(price.getEndTime())) {
                return price;
            }
        }
        return null;
    }

    // ========================================================
    // 3. CREATE BOOKING
    // ========================================================
    @Override
    public BookingResponse createBooking(Integer userId, CreateBookingRequest request) {
        // Validate user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Validate court
        BadmintonCourt court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found: " + request.getCourtId()));

        // Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());
        validateDuration(request.getStartTime(), request.getEndTime());
        validateOperatingHours(request.getStartTime(), request.getEndTime());
        validateFutureBooking(request.getPlayDate(), request.getStartTime());

        // Check availability
        AvailabilityResponse availability = checkAvailability(
                request.getCourtId(), request.getPlayDate(),
                request.getStartTime(), request.getEndTime());

        if (!availability.isAvailable()) {
            throw new RuntimeException("Khung giờ đã có người đặt. " +
                    "Conflicts: " + availability.getConflicts().size());
        }

        // Calculate price
        PriceCalculationResponse priceCalc = calculatePrice(
                request.getCourtId(), request.getPlayDate(),
                request.getStartTime(), request.getEndTime());

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setPlayDate(request.getPlayDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setBufferMinutes(DEFAULT_BUFFER_MINUTES);
        booking.setBasePrice(priceCalc.getTotalPrice());
        booking.setTotalPrice(priceCalc.getTotalPrice());

        // ===== DEPOSIT CALCULATION (1/3 tổng tiền) =====
        BigDecimal depositAmount = priceCalc.getTotalPrice()
                .divide(new BigDecimal("3"), 0, RoundingMode.HALF_UP);
        BigDecimal remainingAmount = priceCalc.getTotalPrice().subtract(depositAmount);

        booking.setDepositAmount(depositAmount);
        booking.setDepositPaid(BigDecimal.ZERO);
        booking.setRemainingAmount(remainingAmount);
        booking.setDepositRequired(true);

        // ===== CHECK-IN DEADLINE (startTime + 20 phút) =====
        LocalDateTime checkInDeadline = LocalDateTime.of(request.getPlayDate(), request.getStartTime())
                .plusMinutes(20);
        booking.setCheckInDeadline(checkInDeadline);

        booking.setStatus("PENDING_PAYMENT"); // Chờ thanh toán deposit
        booking.setBookingType("ONLINE");
        booking.setPaymentStatus("UNPAID");
        booking.setBookingDate(LocalDate.now());
        booking.setCreatedAt(LocalDateTime.now()); // Set thời điểm tạo
        booking.setNotes(request.getNotes());
        booking.setOvertimeMinutes(0);
        booking.setOvertimeFee(BigDecimal.ZERO);

        Booking saved = bookingRepository.save(booking);

        // Save price breakdown
        savePriceBreakdown(saved, priceCalc);

        log.info("Created booking {} for court {} from {} to {} - Deposit required: {}",
                saved.getId(), court.getName(), request.getStartTime(), request.getEndTime(),
                depositAmount);

        return toBookingResponse(saved);
    }

    // ========================================================
    // 4. EXTEND BOOKING - Chỉ cho phép nếu giờ tiếp theo còn trống
    // ========================================================
    @Override
    public BookingResponse extendBooking(Integer bookingId, ExtendBookingRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Chỉ có thể gia hạn khi đang PLAYING hoặc CONFIRMED
        if (!STATUS_PLAYING.equals(booking.getStatus()) && !STATUS_CONFIRMED.equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể gia hạn booking đang PLAYING hoặc CONFIRMED");
        }

        LocalTime currentEndTime = booking.getEndTime();
        if (currentEndTime == null) {
            // Nếu open-ended, dùng estimated duration
            if (booking.getEstimatedDurationMinutes() != null) {
                currentEndTime = booking.getStartTime().plusMinutes(booking.getEstimatedDurationMinutes());
            } else {
                throw new RuntimeException("Không thể xác định giờ kết thúc hiện tại để gia hạn");
            }
        }
        LocalTime newEndTime;

        // Xác định thời gian kết thúc mới
        if (request.getNewEndTime() != null) {
            newEndTime = request.getNewEndTime();
        } else if (request.getExtensionMinutes() != null) {
            newEndTime = currentEndTime.plusMinutes(request.getExtensionMinutes());
        } else {
            throw new RuntimeException("Phải cung cấp newEndTime hoặc extensionMinutes");
        }

        // Validate new end time
        if (!newEndTime.isAfter(currentEndTime)) {
            throw new RuntimeException("Thời gian gia hạn phải sau thời gian kết thúc hiện tại");
        }

        validateOperatingHours(booking.getStartTime(), newEndTime);

        // Check if extension is available (không trùng với booking tiếp theo)
        List<Booking> nextBookings = bookingRepository.findNextBookings(
                booking.getCourt().getId(), booking.getPlayDate(), currentEndTime);

        if (!nextBookings.isEmpty()) {
            Booking nextBooking = nextBookings.get(0);
            LocalTime newEffectiveEnd = newEndTime.plusMinutes(DEFAULT_BUFFER_MINUTES);

            if (newEffectiveEnd.isAfter(nextBooking.getStartTime())) {
                throw new RuntimeException("Không thể gia hạn - có booking tiếp theo lúc " +
                        nextBooking.getStartTime());
            }
        }

        // Calculate extension fee
        int extensionMinutes = (int) Duration.between(currentEndTime, newEndTime).toMinutes();
        PriceCalculationResponse extPrice = calculatePrice(
                booking.getCourt().getId(), booking.getPlayDate(),
                currentEndTime, newEndTime);

        // Create extension record
        BookingExtension extension = new BookingExtension();
        extension.setBooking(booking);
        extension.setOriginalEndTime(currentEndTime);
        extension.setExtendedEndTime(newEndTime);
        extension.setExtensionMinutes(extensionMinutes);
        extension.setExtensionFee(extPrice.getTotalPrice());

        // Update booking
        booking.setEndTime(newEndTime);
        booking.setBasePrice(booking.getBasePrice().add(extPrice.getTotalPrice()));
        booking.setTotalPrice(booking.getTotalPrice().add(extPrice.getTotalPrice()));
        booking.getExtensions().add(extension);

        Booking saved = bookingRepository.save(booking);

        log.info("Extended booking {} from {} to {}. Fee: {}",
                bookingId, currentEndTime, newEndTime, extPrice.getTotalPrice());

        return toBookingResponse(saved);
    }

    // ========================================================
    // 5. CALCULATE OVERTIME FEE - Khi khách về muộn
    // ========================================================
    @Override
    @Transactional(readOnly = true)
    public OvertimeResponse calculateOvertimeFee(Integer bookingId, LocalTime actualEndTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        LocalTime scheduledEnd = booking.getEndTime();
        if (scheduledEnd == null) {
            if (booking.getEstimatedDurationMinutes() != null) {
                scheduledEnd = booking.getStartTime().plusMinutes(booking.getEstimatedDurationMinutes());
            } else {
                // Should not happen for valid open-ended bookings
                // Should not happen for valid open-ended bookings
                scheduledEnd = systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);
            }
        }

        // Nếu về sớm hoặc đúng giờ -> không tính overtime
        if (!actualEndTime.isAfter(scheduledEnd)) {
            return OvertimeResponse.builder()
                    .bookingId(bookingId)
                    .scheduledEndTime(scheduledEnd)
                    .actualEndTime(actualEndTime)
                    .overtimeMinutes(0)
                    .overtimeFee(BigDecimal.ZERO)
                    .message("Khách về đúng giờ hoặc sớm - không tính phí overtime")
                    .build();
        }

        int overtimeMinutes = (int) Duration.between(scheduledEnd, actualEndTime).toMinutes();

        // Cap overtime at max
        if (overtimeMinutes > MAX_OVERTIME_MINUTES) {
            log.warn("Overtime {} minutes exceeds max {}. Capping.", overtimeMinutes, MAX_OVERTIME_MINUTES);
        }

        // Tính phí overtime = giá khung giờ * hệ số overtime * thời gian
        // Lấy giá của khung giờ overtime
        DayType dayType = getDayType(booking.getPlayDate());
        BigDecimal basePricePerHour = courtPriceRepository
                .findPriceForTime(booking.getCourt().getId(), dayType, scheduledEnd)
                .map(CourtPrice::getPricePerHour)
                .orElse(new BigDecimal("100000")); // Default price

        BigDecimal overtimeFee = basePricePerHour
                .multiply(OVERTIME_RATE_MULTIPLIER)
                .multiply(BigDecimal.valueOf(overtimeMinutes))
                .divide(BigDecimal.valueOf(60), 0, RoundingMode.HALF_UP);

        return OvertimeResponse.builder()
                .bookingId(bookingId)
                .scheduledEndTime(scheduledEnd)
                .actualEndTime(actualEndTime)
                .overtimeMinutes(overtimeMinutes)
                .overtimeRate(OVERTIME_RATE_MULTIPLIER)
                .basePricePerHour(basePricePerHour)
                .overtimeFee(overtimeFee)
                .message(String.format("Overtime %d phút, phí: %s VND (hệ số x%.1f)",
                        overtimeMinutes, overtimeFee.toPlainString(), OVERTIME_RATE_MULTIPLIER))
                .build();
    }

    // ========================================================
    // 6. COMPLETE BOOKING - Kết thúc và tính overtime nếu có
    // ========================================================
    @Override
    public BookingResponse completeBooking(Integer bookingId, LocalTime actualEndTime) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!STATUS_PLAYING.equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể hoàn thành booking đang PLAYING");
        }

        // Calculate overtime if applicable
        if (Boolean.TRUE.equals(booking.getOpenEnded())) {
            // Với open-ended booking: Tính lại giá thực tế dựa trên thời gian chơi
            PriceCalculationResponse realPrice = calculatePrice(
                    booking.getCourt().getId(), booking.getPlayDate(),
                    booking.getStartTime(), actualEndTime);

            booking.setTotalPrice(realPrice.getTotalPrice());
            booking.setBasePrice(realPrice.getTotalPrice());
            booking.setOvertimeFee(BigDecimal.ZERO);
            booking.setOvertimeMinutes(0);

            // Cập nhật breakdown mới
            savePriceBreakdown(booking, realPrice);

            log.info("Recalculated price for open-ended booking {}: {}", bookingId, realPrice.getTotalPrice());
        } else {
            OvertimeResponse overtime = calculateOvertimeFee(bookingId, actualEndTime);
            booking.setOvertimeMinutes(overtime.getOvertimeMinutes());
            booking.setOvertimeFee(overtime.getOvertimeFee());
            booking.setTotalPrice(booking.getBasePrice().add(overtime.getOvertimeFee()));
        }

        booking.setActualEndTime(actualEndTime);
        booking.setStatus(STATUS_COMPLETED);
        booking.setCompletedAt(LocalDateTime.now()); // Set thời điểm hoàn thành

        Booking saved = bookingRepository.save(booking);

        log.info("Completed booking {} at {}. Actual end: {}", bookingId, booking.getCompletedAt(), actualEndTime);

        return toBookingResponse(saved);
    }

    // ========================================================
    // 7. OTHER METHODS
    // ========================================================

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        return toBookingResponse(booking);
    }

    @Override
    public BookingResponse updateBookingStatus(Integer bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateStatusTransition(booking.getStatus(), newStatus);
        booking.setStatus(newStatus);

        // Set timestamp theo status mới
        LocalDateTime now = LocalDateTime.now();
        if (STATUS_CONFIRMED.equals(newStatus)) {
            booking.setConfirmedAt(now);
        } else if (STATUS_PLAYING.equals(newStatus)) {
            booking.setCheckedInAt(now);
        } else if (STATUS_COMPLETED.equals(newStatus)) {
            booking.setCompletedAt(now);
        } else if (STATUS_CANCELLED.equals(newStatus)) {
            booking.setCancelledAt(now);
            booking.setCancelledBy("ADMIN");
        }

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Override
    public BookingResponse cancelBooking(Integer bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (STATUS_COMPLETED.equals(booking.getStatus()) || STATUS_CANCELLED.equals(booking.getStatus())) {
            throw new RuntimeException("Không thể hủy booking đã COMPLETED hoặc CANCELLED");
        }

        if (STATUS_PLAYING.equals(booking.getStatus())) {
            throw new RuntimeException("Không thể hủy booking đang PLAYING");
        }

        booking.setStatus(STATUS_CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy("ADMIN");
        String currentNotes = booking.getNotes();
        booking.setNotes(
                appendNote(currentNotes, "Cancelled by admin: " + (reason != null ? reason : "Không có lý do")));

        Booking saved = bookingRepository.save(booking);
        log.info("Cancelled booking {}: {}", bookingId, reason);

        return toBookingResponse(saved);
    }

    @Override
    public BookingResponse cancelMyBooking(Integer userId, Integer bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Kiểm tra booking có thuộc về user này không
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy booking này");
        }

        // KIỂM TRA THỜI GIAN: Chỉ cho phép hủy trước 30 phút so với giờ bắt đầu
        LocalDateTime bookingStart = LocalDateTime.of(booking.getPlayDate(), booking.getStartTime());
        if (bookingStart.isBefore(LocalDateTime.now().plusMinutes(30))) {
            throw new RuntimeException("Chỉ có thể hủy sân trước giờ chơi ít nhất 30 phút.");
        }

        // Logic hủy dựa trên trạng thái hiện tại
        if (STATUS_PENDING.equals(booking.getStatus()) || "PENDING_PAYMENT".equals(booking.getStatus())) {
            // Đang chờ duyệt -> Hủy ngay lập tức
            booking.setStatus(STATUS_CANCELLED);
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancelledBy("USER");
            String currentNotes = booking.getNotes();
            booking.setNotes(
                    appendNote(currentNotes, "Cancelled by user: " + (reason != null ? reason : "Không có lý do")));

            log.info("User {} cancelled PENDING booking {}: {}", userId, bookingId, reason);
        } else if (STATUS_CONFIRMED.equals(booking.getStatus())) {
            // Đã duyệt -> Chuyển sang CANCELLATION_REQUESTED
            booking.setStatus("CANCELLATION_REQUESTED");
            String currentNotes = booking.getNotes();
            booking.setNotes(appendNote(currentNotes,
                    "Cancellation requested by user: " + (reason != null ? reason : "Không có lý do")));

            log.info("User {} requested cancellation for CONFIRMED booking {}: {}", userId, bookingId, reason);
        } else {
            throw new RuntimeException("Không thể hủy booking ở trạng thái " + booking.getStatus() +
                    ". Chỉ có thể hủy khi PENDING hoặc yêu cầu hủy khi CONFIRMED.");
        }

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Override
    public BookingResponse approveCancellation(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!"CANCELLATION_REQUESTED".equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể duyệt yêu cầu hủy khi trạng thái là CANCELLATION_REQUESTED");
        }

        booking.setStatus(STATUS_CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy("ADMIN (Approved Request)");

        Booking saved = bookingRepository.save(booking);
        log.info("Admin approved cancellation for booking {}", bookingId);

        return toBookingResponse(saved);
    }

    @Override
    public BookingResponse rejectCancellation(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (!"CANCELLATION_REQUESTED".equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể từ chối yêu cầu hủy khi trạng thái là CANCELLATION_REQUESTED");
        }

        // Revert to CONFIRMED
        booking.setStatus(STATUS_CONFIRMED);
        String currentNotes = booking.getNotes();
        booking.setNotes(appendNote(currentNotes, "Cancellation request rejected by admin at " + LocalDateTime.now()));

        Booking saved = bookingRepository.save(booking);
        log.info("Admin rejected cancellation for booking {}", bookingId);

        return toBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Integer userId, LocalDate fromDate, LocalDate toDate) {
        List<Booking> bookings = bookingRepository.findByUserIdAndPlayDateBetween(userId, fromDate, toDate);
        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookingsWithFilter(Integer userId, LocalDate fromDate, LocalDate toDate,
            String status, String paymentStatus) {
        List<Booking> bookings;

        // Nếu có filter date thì dùng, không thì lấy tất cả
        if (fromDate != null && toDate != null) {
            bookings = bookingRepository.findByUserIdAndPlayDateBetween(userId, fromDate, toDate);
        } else {
            bookings = bookingRepository.findByUserId(userId);
        }

        // Filter theo status nếu có
        if (status != null && !status.isEmpty()) {
            bookings = bookings.stream()
                    .filter(b -> status.equalsIgnoreCase(b.getStatus()))
                    .collect(Collectors.toList());
        }

        // Filter theo paymentStatus nếu có
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            bookings = bookings.stream()
                    .filter(b -> paymentStatus.equalsIgnoreCase(b.getPaymentStatus()))
                    .collect(Collectors.toList());
        }

        // Sắp xếp theo ngày giảm dần (mới nhất trước)
        bookings.sort((b1, b2) -> {
            int dateCompare = b2.getPlayDate().compareTo(b1.getPlayDate());
            if (dateCompare != 0)
                return dateCompare;
            return b2.getStartTime().compareTo(b1.getStartTime());
        });

        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getCourtBookings(Integer courtId, LocalDate date) {
        List<Booking> bookings = bookingRepository.findByCourtIdAndPlayDate(courtId, date);
        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse checkIn(Integer bookingId) {
        log.info("Processing check-in for bookingId: {}", bookingId);
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

            if (!STATUS_CONFIRMED.equals(booking.getStatus())) {
                log.warn("Invalid check-in attempt for booking {} with status {}", bookingId, booking.getStatus());
                throw new RuntimeException("Chỉ có thể check-in booking đã CONFIRMED");
            }

            booking.setStatus(STATUS_PLAYING);
            booking.setCheckedInAt(LocalDateTime.now()); // Set thời điểm check-in
            Booking saved = bookingRepository.save(booking);

            // Force initialization of lazy loaded fields if needed to avoid
            // LazyInitializationException
            if (saved.getCourt() != null) {
                saved.getCourt().getName();
                if (saved.getCourt().getType() != null) {
                    saved.getCourt().getType().name();
                }
            }
            if (saved.getUser() != null) {
                saved.getUser().getFullName();
            }

            log.info("Checked in booking {} at {}", bookingId, booking.getCheckedInAt());
            return toBookingResponse(saved);
        } catch (Exception e) {
            log.error("Error checking in booking {}: {}", bookingId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse.AvailableSlot> getAvailableSlots(Integer courtId, LocalDate date) {
        List<Booking> bookings = bookingRepository.findActiveBookingsByCourtAndDate(courtId, date, null);
        return findAvailableSlots(courtId, date, bookings);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingPageResponse getAllBookingsWithFilter(Integer courtId, String status, String paymentStatus,
            LocalDate fromDate, LocalDate toDate, int page, int size) {
        // Lấy tất cả booking
        List<Booking> allBookings = bookingRepository.findAll();

        // Filter theo courtId nếu có
        if (courtId != null) {
            allBookings = allBookings.stream()
                    .filter(b -> b.getCourt() != null && courtId.equals(b.getCourt().getId()))
                    .collect(Collectors.toList());
        }

        // Filter theo status nếu có
        if (status != null && !status.isEmpty()) {
            allBookings = allBookings.stream()
                    .filter(b -> status.equalsIgnoreCase(b.getStatus()))
                    .collect(Collectors.toList());
        }

        // Filter theo paymentStatus nếu có
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            allBookings = allBookings.stream()
                    .filter(b -> paymentStatus.equalsIgnoreCase(b.getPaymentStatus()))
                    .collect(Collectors.toList());
        }

        // Filter theo khoảng ngày nếu có
        if (fromDate != null && toDate != null) {
            allBookings = allBookings.stream()
                    .filter(b -> b.getPlayDate() != null &&
                            !b.getPlayDate().isBefore(fromDate) &&
                            !b.getPlayDate().isAfter(toDate))
                    .collect(Collectors.toList());
        } else if (fromDate != null) {
            allBookings = allBookings.stream()
                    .filter(b -> b.getPlayDate() != null && !b.getPlayDate().isBefore(fromDate))
                    .collect(Collectors.toList());
        } else if (toDate != null) {
            allBookings = allBookings.stream()
                    .filter(b -> b.getPlayDate() != null && !b.getPlayDate().isAfter(toDate))
                    .collect(Collectors.toList());
        }

        // Sắp xếp theo ngày đặt giảm dần (mới nhất trước), sau đó theo ngày chơi
        allBookings.sort((b1, b2) -> {
            // So sánh theo bookingDate (ngày đặt) - mới nhất trước
            LocalDate date1 = b1.getBookingDate();
            LocalDate date2 = b2.getBookingDate();
            if (date1 != null && date2 != null) {
                int bookingDateCompare = date2.compareTo(date1);
                if (bookingDateCompare != 0)
                    return bookingDateCompare;
            } else if (date1 == null && date2 != null) {
                return 1; // null đứng sau
            } else if (date1 != null && date2 == null) {
                return -1;
            }

            // Nếu cùng ngày đặt, so sánh theo bookingId giảm dần (ID lớn = mới hơn)
            return b2.getId().compareTo(b1.getId());
        });

        // Tính toán phân trang
        int totalElements = allBookings.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);

        // Lấy sublist cho trang hiện tại
        List<Booking> pageContent = (fromIndex < totalElements)
                ? allBookings.subList(fromIndex, toIndex)
                : List.of();

        // Convert sang response
        List<BookingResponse> content = pageContent.stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());

        return BookingPageResponse.builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .build();
    }

    // ========================================================
    // EARLY RELEASE - Mở slot do khách về sớm
    // ========================================================
    @Override
    public EarlyReleaseResponse releaseEarly(Integer bookingId, String releasedBy) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        // Rule 1: Booking phải COMPLETED
        if (!STATUS_COMPLETED.equals(booking.getStatus())) {
            return EarlyReleaseResponse.builder()
                    .released(false)
                    .message("Chỉ có thể release slot từ booking đã COMPLETED. Status hiện tại: " + booking.getStatus())
                    .sourceBookingId(bookingId)
                    .build();
        }

        // Rule 2: actualEndTime < endTime (khách về sớm)
        LocalTime actualEndTime = booking.getActualEndTime();
        LocalTime scheduledEndTime = booking.getEndTime();

        if (actualEndTime == null) {
            return EarlyReleaseResponse.builder()
                    .released(false)
                    .message("Booking chưa có actualEndTime. Vui lòng complete booking với actualEndTime trước.")
                    .sourceBookingId(bookingId)
                    .build();
        }

        if (!actualEndTime.isBefore(scheduledEndTime)) {
            return EarlyReleaseResponse.builder()
                    .released(false)
                    .message("Khách không về sớm. actualEndTime (" + actualEndTime +
                            ") >= endTime (" + scheduledEndTime + ")")
                    .sourceBookingId(bookingId)
                    .build();
        }

        // Rule 3: Thời gian dư >= MIN_BOOKING_DURATION (30 phút)
        int releasedMinutes = (int) Duration.between(actualEndTime, scheduledEndTime).toMinutes();
        if (releasedMinutes < MIN_BOOKING_DURATION) {
            return EarlyReleaseResponse.builder()
                    .released(false)
                    .message("Thời gian dư (" + releasedMinutes + " phút) < tối thiểu (" +
                            MIN_BOOKING_DURATION + " phút). Không đủ để mở slot mới.")
                    .sourceBookingId(bookingId)
                    .build();
        }

        // Rule 4: Slot chưa từng được release trước đó
        if (releasedSlotRepository.existsBySourceBookingId(bookingId)) {
            ReleasedSlot existingSlot = releasedSlotRepository.findBySourceBookingId(bookingId)
                    .orElse(null);
            return EarlyReleaseResponse.builder()
                    .released(false)
                    .message("Booking này đã được release trước đó. ReleasedSlot ID: " +
                            (existingSlot != null ? existingSlot.getId() : "unknown"))
                    .sourceBookingId(bookingId)
                    .releasedSlotId(existingSlot != null ? existingSlot.getId() : null)
                    .build();
        }

        // Tạo ReleasedSlot mới
        ReleasedSlot releasedSlot = new ReleasedSlot();
        releasedSlot.setCourt(booking.getCourt());
        releasedSlot.setSourceBooking(booking);
        releasedSlot.setPlayDate(booking.getPlayDate());
        releasedSlot.setStartTime(actualEndTime); // Slot bắt đầu từ lúc khách về
        releasedSlot.setEndTime(scheduledEndTime); // Đến giờ kết thúc gốc
        releasedSlot.setDurationMinutes(releasedMinutes);
        releasedSlot.setType("EARLY_RELEASE");
        releasedSlot.setStatus("AVAILABLE");
        releasedSlot.setReleasedAt(LocalDateTime.now());
        releasedSlot.setReleasedBy(releasedBy);
        releasedSlot.setNotes("Released from booking #" + bookingId +
                ". Original: " + booking.getStartTime() + "-" + scheduledEndTime +
                ", Actual checkout: " + actualEndTime);

        ReleasedSlot saved = releasedSlotRepository.save(releasedSlot);

        log.info("Released slot from booking {}. Court: {}, Date: {}, Time: {}-{}, Minutes: {}",
                bookingId, booking.getCourt().getName(), booking.getPlayDate(),
                actualEndTime, scheduledEndTime, releasedMinutes);

        return EarlyReleaseResponse.builder()
                .released(true)
                .message("Đã mở slot thành công! Khung giờ " + actualEndTime + "-" + scheduledEndTime +
                        " (" + releasedMinutes + " phút) đã sẵn sàng cho người khác đặt.")
                .releasedFrom(actualEndTime)
                .releasedTo(scheduledEndTime)
                .minutes(releasedMinutes)
                .releasedSlotId(saved.getId())
                .sourceBookingId(bookingId)
                .courtId(booking.getCourt().getId())
                .courtName(booking.getCourt().getName())
                .playDate(booking.getPlayDate())
                .originalStartTime(booking.getStartTime())
                .originalEndTime(scheduledEndTime)
                .actualEndTime(actualEndTime)
                .build();
    }

    // ========================================================
    // WALK-IN BOOKING - Admin tạo booking cho khách vãng lai
    // ========================================================
    private static final int MAX_PAST_BOOKING_DAYS = 7; // Cho phép tạo booking tối đa 7 ngày trong quá khứ

    @Override
    public BookingResponse createWalkInBooking(WalkInBookingRequest request, String adminUsername) {
        log.info("Admin {} creating walk-in booking for court {}", adminUsername, request.getCourtId());

        // Validate court
        BadmintonCourt court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found: " + request.getCourtId()));

        // Validate date - cho phép quá khứ trong giới hạn
        validateWalkInDate(request.getPlayDate(), request.getStartTime());

        // Xác định endTime
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();
        boolean isOpenEnded = Boolean.TRUE.equals(request.getOpenEnded()) || endTime == null;

        if (endTime == null) {
            // Tính endTime cho việc kiểm tra availability và giá
            // Nhưng khi lưu vào DB thì endTime sẽ là null nếu openEnded = true
            if (request.getEstimatedDurationMinutes() != null && request.getEstimatedDurationMinutes() > 0) {
                // Tạm tính endTime để check availability
                LocalTime tempEnd = startTime.plusMinutes(request.getEstimatedDurationMinutes());
                // Đảm bảo không vượt quá giờ đóng cửa
                LocalTime operatingEnd = systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);
                endTime = tempEnd.isAfter(operatingEnd) ? operatingEnd : tempEnd;
            } else {
                // Mặc định: tính đến giờ đóng cửa hoặc 2 giờ (lấy min)
                LocalTime maxEndByDuration = startTime.plusMinutes(DEFAULT_OPEN_ENDED_DURATION);
                LocalTime operatingEnd = systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);
                endTime = maxEndByDuration.isBefore(operatingEnd) ? maxEndByDuration : operatingEnd;
            }
            log.info("Open-ended booking: calculated temporary endTime = {} for check (isOpenEnded={})", endTime,
                    isOpenEnded);
        }

        // Validate time range
        validateTimeRange(startTime, endTime);
        validateDuration(startTime, endTime);
        validateOperatingHours(startTime, endTime);

        // Check availability - cho open-ended booking, chỉ kiểm tra đến endTime tạm
        // tính
        AvailabilityResponse availability = checkAvailability(
                request.getCourtId(), request.getPlayDate(), startTime, endTime);

        if (!availability.isAvailable()) {
            throw new RuntimeException("Khung giờ đã có người đặt. " +
                    "Conflicts: " + availability.getConflicts().size());
        }

        // Calculate price - cho open-ended, giá chỉ là tạm tính
        PriceCalculationResponse priceCalc = calculatePrice(
                request.getCourtId(), request.getPlayDate(), startTime, endTime);

        // Get user if provided
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUserId()));
        }

        // Validate guest info nếu không có user
        if (user == null && (request.getGuestName() == null || request.getGuestName().isBlank())) {
            throw new RuntimeException("Phải cung cấp userId hoặc guestName cho booking walk-in");
        }

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setCourt(court);
        booking.setPlayDate(request.getPlayDate());
        booking.setStartTime(startTime);

        // Nếu là open-ended, lưu endTime là null, và lưu estimatedDurationMinutes +
        // maxDurationMinutes
        if (isOpenEnded) {
            booking.setEndTime(null);
            // Set estimated duration (default 2 tiếng nếu không truyền)
            Integer estMinutes = request.getEstimatedDurationMinutes();
            booking.setEstimatedDurationMinutes(estMinutes != null ? estMinutes : DEFAULT_OPEN_ENDED_DURATION);

            // Set max duration cho soft-block (default 4 tiếng nếu không truyền)
            Integer maxMinutes = request.getMaxDurationMinutes();
            booking.setMaxDurationMinutes(maxMinutes != null ? maxMinutes : DEFAULT_MAX_DURATION);
        } else {
            booking.setEndTime(endTime);
        }
        booking.setBufferMinutes(DEFAULT_BUFFER_MINUTES);
        booking.setBasePrice(priceCalc.getTotalPrice());
        booking.setTotalPrice(priceCalc.getTotalPrice());
        booking.setBookingDate(LocalDate.now());
        booking.setNotes(request.getNotes());
        booking.setOvertimeMinutes(0);
        booking.setOvertimeFee(BigDecimal.ZERO);

        // Walk-in specific fields
        booking.setBookingType("WALK_IN");
        booking.setOpenEnded(isOpenEnded);
        booking.setGuestName(request.getGuestName());
        booking.setGuestPhone(request.getGuestPhone());
        booking.setCreatedBy(adminUsername);

        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        booking.setCreatedAt(now);

        // Determine initial status
        String initialStatus = request.getInitialStatus();
        if (initialStatus == null || initialStatus.isBlank()) {
            initialStatus = STATUS_PLAYING; // Default cho walk-in
        }

        // Validate initial status
        if (!STATUS_PLAYING.equals(initialStatus) && !STATUS_CONFIRMED.equals(initialStatus)) {
            throw new RuntimeException("Walk-in booking chỉ có thể bắt đầu với status PLAYING hoặc CONFIRMED");
        }

        booking.setStatus(initialStatus);

        // Set timestamps based on status
        if (STATUS_PLAYING.equals(initialStatus)) {
            booking.setConfirmedAt(now);
            booking.setCheckedInAt(now);
            booking.setPaymentStatus("UNPAID"); // Thanh toán khi checkout
        } else {
            booking.setConfirmedAt(now);
            booking.setPaymentStatus("UNPAID");
        }

        // Thêm note nếu là open-ended
        if (isOpenEnded) {
            String currentNotes = booking.getNotes() != null ? booking.getNotes() : "";

            // Tính endTime đã được tính ở trên (biến endTime), dùng lại
            Integer estMinutes = request.getEstimatedDurationMinutes();
            int actualEstMinutes = estMinutes != null ? estMinutes : DEFAULT_OPEN_ENDED_DURATION;

            String note = "[OPEN-ENDED] Giờ kết thúc dự kiến: "
                    + endTime
                    + " (~"
                    + actualEstMinutes
                    + " phút). Thời gian có thể thay đổi, giá sẽ được tính lại khi checkout.";

            booking.setNotes(
                    currentNotes.isEmpty()
                            ? note
                            : currentNotes + "\n" + note);
        }
        Booking saved = bookingRepository.save(booking);

        // Save price breakdown
        savePriceBreakdown(saved, priceCalc);

        log.info("Created walk-in booking {} for court {} from {} to {}. OpenEnded: {}. Status: {}. Created by: {}",
                saved.getId(), court.getName(), startTime, endTime, isOpenEnded, initialStatus, adminUsername);

        return toBookingResponse(saved);
    }

    /**
     * Validate date cho walk-in booking
     * - Cho phép tạo booking trong quá khứ (tối đa MAX_PAST_BOOKING_DAYS ngày)
     * - Cho phép tạo booking trong tương lai
     */
    private void validateWalkInDate(LocalDate playDate, LocalTime startTime) {
        LocalDate today = LocalDate.now();
        LocalDate minDate = today.minusDays(MAX_PAST_BOOKING_DAYS);

        if (playDate.isBefore(minDate)) {
            throw new RuntimeException("Không thể tạo booking quá " + MAX_PAST_BOOKING_DAYS +
                    " ngày trong quá khứ. Ngày sớm nhất cho phép: " + minDate);
        }

        // Nếu là ngày hôm nay và thời gian đã qua, vẫn cho phép (vì khách walk-in)
        // Chỉ log warning
        if (playDate.equals(today) && startTime.isBefore(LocalTime.now())) {
            log.info("Walk-in booking created for past time today: {} {}", playDate, startTime);
        }
    }

    // ========================================================
    // HELPER METHODS
    // ========================================================

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null) {
            throw new RuntimeException("Start time không được null");
        }
        // Cho phép endTime null nếu là xử lý logic open-ended ở ngữ cảnh khác,
        // nhưng ở đây thường được gọi sau khi đã tính toán endTime tạm thời.
        // Tuy nhiên để an toàn, nếu endTime null thì bỏ qua check after
        if (endTime != null && !endTime.isAfter(startTime)) {
            throw new RuntimeException("End time phải sau start time");
        }
    }

    private void validateDuration(LocalTime startTime, LocalTime endTime) {
        if (endTime == null)
            return; // Bỏ qua nếu endTime null
        int duration = (int) Duration.between(startTime, endTime).toMinutes();
        if (duration < MIN_BOOKING_DURATION) {
            throw new RuntimeException("Thời lượng đặt sân tối thiểu " + MIN_BOOKING_DURATION + " phút");
        }
        // Bỏ kiểm tra thời gian tối đa
    }

    private void validateOperatingHours(LocalTime startTime, LocalTime endTime) {
        LocalTime operatingStart = systemConfigService.getTime("OPERATING_START", DEFAULT_OPERATING_START);
        LocalTime operatingEnd = systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);

        if (startTime.isBefore(operatingStart)) {
            throw new RuntimeException("Giờ hoạt động từ " + operatingStart + " đến " + operatingEnd);
        }
        if (endTime != null && endTime.isAfter(operatingEnd)) {
            throw new RuntimeException("Giờ hoạt động từ " + operatingStart + " đến " + operatingEnd);
        }
    }

    private void validateFutureBooking(LocalDate playDate, LocalTime startTime) {
        LocalDate today = LocalDate.now();
        if (playDate.isBefore(today)) {
            throw new RuntimeException("Không thể đặt sân cho ngày trong quá khứ");
        }
        if (playDate.equals(today) && startTime.isBefore(LocalTime.now())) {
            throw new RuntimeException("Không thể đặt sân cho giờ đã qua");
        }
    }

    private void validateStatusTransition(String current, String newStatus) {
        Map<String, Set<String>> validTransitions = Map.of(
                STATUS_PENDING, Set.of(STATUS_CONFIRMED, STATUS_CANCELLED),
                STATUS_CONFIRMED, Set.of(STATUS_PLAYING, STATUS_CANCELLED),
                STATUS_PLAYING, Set.of(STATUS_COMPLETED),
                STATUS_COMPLETED, Set.of(),
                STATUS_CANCELLED, Set.of());

        Set<String> allowed = validTransitions.getOrDefault(current, Set.of());
        if (!allowed.contains(newStatus)) {
            throw new RuntimeException("Không thể chuyển từ " + current + " sang " + newStatus);
        }
    }

    private DayType getDayType(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            return DayType.WEEKEND;
        }
        return DayType.WEEKDAY;
    }

    private String getPeriodName(LocalTime time) {
        if (time == null)
            return "Ngoài giờ";
        int hour = time.getHour();
        if (hour >= 6 && hour < 8)
            return "Sáng sớm";
        if (hour >= 8 && hour < 11)
            return "Sáng";
        if (hour >= 11 && hour < 14)
            return "Trưa";
        if (hour >= 14 && hour < 17)
            return "Chiều";
        if (hour >= 17 && hour < 21)
            return "Giờ vàng";
        if (hour >= 21 && hour < 22)
            return "Tối muộn";
        return "Ngoài giờ";
    }

    private List<AvailabilityResponse.AvailableSlot> findAvailableSlots(
            Integer courtId, LocalDate date, List<Booking> existingBookings) {

        List<AvailabilityResponse.AvailableSlot> slots = new ArrayList<>();

        // Sort bookings by start time and filter out invalid bookings
        List<Booking> sorted = existingBookings.stream()
                .filter(b -> b.getStartTime() != null) // Filter out null start times only
                .sorted(Comparator.comparing(Booking::getStartTime))
                .collect(Collectors.toList());

        LocalTime currentStart = systemConfigService.getTime("OPERATING_START", DEFAULT_OPERATING_START);

        for (Booking booking : sorted) {
            LocalTime bookingStart = booking.getStartTime();
            LocalTime bookingEffectiveEnd = booking.getEffectiveEndTime();

            // Skip if effective end time is null
            if (bookingEffectiveEnd == null) {
                continue;
            }

            // Gap before this booking
            if (currentStart.isBefore(bookingStart)) {
                int gap = (int) Duration.between(currentStart, bookingStart).toMinutes();
                if (gap >= MIN_BOOKING_DURATION) {
                    slots.add(AvailabilityResponse.AvailableSlot.builder()
                            .startTime(currentStart)
                            .endTime(bookingStart)
                            .durationMinutes(gap)
                            .build());
                }
            }

            // Move current to after this booking (including buffer)
            currentStart = bookingEffectiveEnd;
        }

        // Gap after last booking until closing
        LocalTime operatingEnd = systemConfigService.getTime("OPERATING_END", DEFAULT_OPERATING_END);
        if (currentStart != null && currentStart.isBefore(operatingEnd)) {
            int gap = (int) Duration.between(currentStart, operatingEnd).toMinutes();
            if (gap >= MIN_BOOKING_DURATION) {
                slots.add(AvailabilityResponse.AvailableSlot.builder()
                        .startTime(currentStart)
                        .endTime(operatingEnd)
                        .durationMinutes(gap)
                        .build());
            }
        }

        return slots;
    }

    private void savePriceBreakdown(Booking booking, PriceCalculationResponse priceCalc) {
        // Clear existing breakdowns instead of reassigning the collection
        // to avoid "collection was no longer referenced" error with orphanRemoval=true
        booking.getPriceBreakdowns().clear();

        for (PriceCalculationResponse.PriceSegment segment : priceCalc.getBreakdown()) {
            BookingPriceBreakdown breakdown = new BookingPriceBreakdown();
            breakdown.setBooking(booking);
            breakdown.setPeriodStart(segment.getStart());
            breakdown.setPeriodEnd(segment.getEnd());
            breakdown.setDurationMinutes(segment.getMinutes());
            breakdown.setPricePerHour(segment.getPricePerHour());
            breakdown.setSubtotal(segment.getSubtotal());
            breakdown.setDayType(priceCalc.getDayType());
            booking.getPriceBreakdowns().add(breakdown);
        }
    }

    private String appendNote(String currentNotes, String newNote) {
        if (currentNotes == null)
            currentNotes = "";
        if (newNote == null)
            newNote = "";

        // Nếu newNote quá dài, cắt bớt
        if (newNote.length() > 255) {
            newNote = newNote.substring(0, 255);
        }

        String separator = currentNotes.isEmpty() ? "" : "\n";
        String result = currentNotes + separator + newNote;

        if (result.length() <= 255) {
            return result;
        }

        // Nếu tổng độ dài > 255, ưu tiên giữ lại nội dung mới nhất (newNote)
        // và cắt bớt nội dung cũ từ đầu
        // "[...truncated] " + old_part + separator + newNote
        String prefix = "[...] ";
        int spaceForOld = 255 - newNote.length() - separator.length() - prefix.length();

        if (spaceForOld <= 0) {
            // Trường hợp cực hiếm khi newNote chiếm gần hết 255 chars
            return newNote.substring(0, Math.min(newNote.length(), 255));
        }

        // Cắt currentNotes lấy phần cuối
        String keptOld = currentNotes.substring(currentNotes.length() - spaceForOld);
        return prefix + keptOld + separator + newNote;
    }

    private BookingResponse toBookingResponse(Booking booking) {
        List<BookingResponse.PriceBreakdownDTO> breakdownDTOs = new ArrayList<>();
        if (booking.getPriceBreakdowns() != null) {
            for (BookingPriceBreakdown b : booking.getPriceBreakdowns()) {
                breakdownDTOs.add(BookingResponse.PriceBreakdownDTO.builder()
                        .periodStart(b.getPeriodStart())
                        .periodEnd(b.getPeriodEnd())
                        .durationMinutes(b.getDurationMinutes())
                        .pricePerHour(b.getPricePerHour())
                        .subtotal(b.getSubtotal())
                        .dayType(b.getDayType())
                        .build());
            }
        }

        List<BookingResponse.ExtensionDTO> extensionDTOs = new ArrayList<>();
        if (booking.getExtensions() != null) {
            for (BookingExtension e : booking.getExtensions()) {
                extensionDTOs.add(BookingResponse.ExtensionDTO.builder()
                        .originalEndTime(e.getOriginalEndTime())
                        .extendedEndTime(e.getExtendedEndTime())
                        .extensionMinutes(e.getExtensionMinutes())
                        .extensionFee(e.getExtensionFee())
                        .build());
            }
        }

        BadmintonCourt court = booking.getCourt();
        User user = booking.getUser();

        // Lấy startTime và endTime - ưu tiên từ booking
        LocalTime startTime = booking.getStartTime();
        LocalTime endTime = booking.getEndTime();
        Boolean openEnded = Boolean.TRUE.equals(booking.getOpenEnded());

        // Nếu booking cũ không có startTime/endTime, lấy từ priceBreakdown
        // NHƯNG: nếu là openEnded thì không được lấy endTime từ breakdown (vì breakdown
        // luôn có end time tạm tính)
        if ((startTime == null || endTime == null) && !breakdownDTOs.isEmpty()) {
            // Sort breakdown theo periodStart
            breakdownDTOs.sort(Comparator.comparing(BookingResponse.PriceBreakdownDTO::getPeriodStart));
            if (startTime == null)
                startTime = breakdownDTOs.get(0).getPeriodStart();

            // Chỉ patch endTime nếu KHÔNG PHẢI open-ended
            if (endTime == null && !openEnded) {
                endTime = breakdownDTOs.get(breakdownDTOs.size() - 1).getPeriodEnd();
            }
        }

        // Tính duration
        int durationMinutes = 0;

        if (startTime != null && endTime != null) {
            durationMinutes = (int) Duration.between(startTime, endTime).toMinutes();
        } else if (openEnded && booking.getEstimatedDurationMinutes() != null) {
            durationMinutes = booking.getEstimatedDurationMinutes();
        }

        // Determine bookingType with fallback logic when DB field is null
        String bookingTypeVal = booking.getBookingType();
        if (bookingTypeVal == null || bookingTypeVal.isBlank()) {
            if (booking.getCreatedBy() != null && !booking.getCreatedBy().isBlank()) {
                bookingTypeVal = "WALK_IN";
            } else if (booking.getUser() != null) {
                bookingTypeVal = "ONLINE";
            } else {
                bookingTypeVal = "WALK_IN"; // default fallback
            }
        }

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .courtId(court != null ? court.getId() : null)
                .courtName(court != null ? court.getName() : null)
                .courtType(court != null && court.getType() != null ? court.getType().name() : null)
                .courtImage(court != null ? court.getImageUrl() : null)
                .customerId(user != null ? user.getId() : null)
                .customerName(user != null ? user.getFullName()
                        : (booking.getGuestName() != null ? booking.getGuestName() : null))
                .customerPhone(user != null ? user.getPhoneNumber()
                        : (booking.getGuestPhone() != null ? booking.getGuestPhone() : null))
                // Booking type & guest info
                .bookingType(bookingTypeVal)
                .openEnded(booking.getOpenEnded())
                .guestName(booking.getGuestName())
                .guestPhone(booking.getGuestPhone())
                .createdBy(booking.getCreatedBy())
                .playDate(booking.getPlayDate())
                .startTime(startTime)
                .endTime(endTime)
                .actualEndTime(booking.getActualEndTime())
                .durationMinutes(durationMinutes)
                .estimatedDurationMinutes(booking.getEstimatedDurationMinutes())
                .bufferMinutes(booking.getBufferMinutes())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .basePrice(booking.getBasePrice())
                .overtimeFee(booking.getOvertimeFee())
                .totalPrice(booking.getTotalPrice())
                .overtimeMinutes(booking.getOvertimeMinutes())
                .priceBreakdown(breakdownDTOs)
                .extensions(extensionDTOs)
                .notes(booking.getNotes())
                .bookingDate(booking.getBookingDate())
                // ===== DEPOSIT & PAYMENT =====
                .depositAmount(booking.getDepositAmount())
                .depositPaid(booking.getDepositPaid())
                .remainingAmount(booking.getRemainingAmount())
                .depositRequired(booking.getDepositRequired())
                .checkInDeadline(booking.getCheckInDeadline())
                // ===== TIMESTAMPS =====
                .createdAt(booking.getCreatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .checkedInAt(booking.getCheckedInAt())
                .completedAt(booking.getCompletedAt())
                .cancelledAt(booking.getCancelledAt())
                .cancelledBy(booking.getCancelledBy())
                .build();
    }
}
