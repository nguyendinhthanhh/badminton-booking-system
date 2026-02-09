package com.badminton.booking.service.impl;

import com.badminton.booking.dto.request.BadmintonCourtCreateRequest;
import com.badminton.booking.dto.request.BadmintonCourtUpdateRequest;
import com.badminton.booking.dto.response.BadmintonCourtResponse;
import com.badminton.booking.dto.response.CourtDetailResponse;
import com.badminton.booking.entity.BadmintonCourt;
import com.badminton.booking.entity.Booking;
import com.badminton.booking.entity.CourtPrice;
import com.badminton.booking.entity.enums.CourtStatus;
import com.badminton.booking.entity.enums.DayType;
import com.badminton.booking.mapper.BadmintonCourtMapper;
import com.badminton.booking.repository.BadmintonCourtRepo;
import com.badminton.booking.repository.BookingRepository;
import com.badminton.booking.repository.CourtPriceRepository;
import com.badminton.booking.service.BadmintonCourtService;
import com.badminton.booking.service.CourtPriceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.SliceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BadmintonCourtServiceImpl implements BadmintonCourtService {

    @Autowired
    private BadmintonCourtRepo badmintonCourtRepo;
    @Autowired
    private BadmintonCourtMapper badmintonCourtMapper;
    @Autowired
    private CourtPriceService courtPriceService;
    @Autowired
    private CourtPriceRepository courtPriceRepository;
    @Autowired
    private BookingRepository bookingRepository;

    // Default operating hours
    private static final LocalTime DEFAULT_OPEN_TIME = LocalTime.of(6, 0);
    private static final LocalTime DEFAULT_CLOSE_TIME = LocalTime.of(22, 0);
    private static final int MIN_AVAILABLE_MINUTES = 60;

    @Override
    @Transactional
    public BadmintonCourtResponse createBadmintonCourt(BadmintonCourtCreateRequest request) {
        BadmintonCourt court = badmintonCourtMapper.toEntity(request);
        court.setStatus(CourtStatus.ACTIVE);
        court.setCreatedAt(LocalDateTime.now());

        // Handle images from request list
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            java.util.Set<com.badminton.booking.entity.CourtImage> courtImages = new java.util.LinkedHashSet<>();
            int order = 0;
            for (String url : request.getImages()) {
                if (url != null && !url.isBlank()) {
                    com.badminton.booking.entity.CourtImage img = com.badminton.booking.entity.CourtImage.builder()
                            .court(court)
                            .imageUrl(url)
                            .isPrimary(order == 0)
                            .displayOrder(order++)
                            .build();
                    courtImages.add(img);
                }
            }
            court.setImages(courtImages);

            // Backward compatibility: Ensure fast access imageUrl is set
            if (!courtImages.isEmpty() && (court.getImageUrl() == null || court.getImageUrl().isEmpty())) {
                court.setImageUrl(courtImages.iterator().next().getImageUrl());
            }
        }
        // Backward compatibility: Convert single imageUrl to CourtImage if list is
        // empty
        else if (court.getImageUrl() != null && !court.getImageUrl().isEmpty()) {
            com.badminton.booking.entity.CourtImage img = com.badminton.booking.entity.CourtImage.builder()
                    .court(court)
                    .imageUrl(court.getImageUrl())
                    .isPrimary(true)
                    .displayOrder(0)
                    .build();
            court.setImages(new java.util.HashSet<>(java.util.Collections.singletonList(img)));
        }

        BadmintonCourt savedCourt = badmintonCourtRepo.save(court);

        // Tự động tạo bảng giá mặc định cho sân mới
        courtPriceService.createDefaultPricesForCourt(savedCourt.getId());

        // Single court → dùng single query
        return toEnrichedResponseSingle(savedCourt);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice<BadmintonCourtResponse> getAllBadmintonCourts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Slice<BadmintonCourt> badmintonCourts = badmintonCourtRepo.findAllBy(pageable);

        if (badmintonCourts.isEmpty()) {
            return new SliceImpl<>(Collections.emptyList(), pageable, false);
        }

        // ===== TỐI ƯU: Chỉ 3 queries cho TẤT CẢ courts =====
        List<BadmintonCourt> courts = badmintonCourts.getContent();
        List<Integer> courtIds = courts.stream().map(BadmintonCourt::getId).collect(Collectors.toList());

        // Query 1: Lấy price summary của tất cả courts
        Map<Integer, CourtPriceSummary> priceSummaryMap = getPriceSummaryMap(courtIds);

        // Query 2: Lấy booking summary của tất cả courts cho hôm nay
        LocalDate today = LocalDate.now();
        Map<Integer, Long> bookedMinutesMap = getBookedMinutesMap(today);

        // Build response với data đã có sẵn (không query thêm)
        LocalTime now = LocalTime.now();
        List<BadmintonCourtResponse> enrichedList = courts.stream()
                .map(court -> toEnrichedResponseBulk(court, priceSummaryMap, bookedMinutesMap, now))
                .collect(Collectors.toList());

        log.debug("getAllBadmintonCourts: {} courts loaded with 3 queries", courts.size());

        return new SliceImpl<>(enrichedList, pageable, badmintonCourts.hasNext());
    }

    @Override
    @Transactional(readOnly = true)
    public BadmintonCourtResponse getBadmintonCourtById(Integer id) {
        return badmintonCourtRepo.findByIdWithImages(id)
                .map(this::toEnrichedResponseSingle)
                .orElseThrow(() -> new RuntimeException("Badminton court not found with id: " + id));
    }

    @Override
    public void deleteBadmintonCourtById(Integer id) {
        BadmintonCourt court = badmintonCourtRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Badminton court not found with id: " + id));
        badmintonCourtRepo.deleteById(court.getId());
    }

    @Override
    @Transactional
    public void updateBadmintonCourt(Integer id, BadmintonCourtUpdateRequest request) {
        BadmintonCourt court = badmintonCourtRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Badminton court not found with id: " + id));

        court.setUpdatedAt(LocalDateTime.now());
        badmintonCourtMapper.updateBadmintonCourt(court, request);

        // Handle multiple images
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            // Remove existing images
            court.getImages().clear();

            // Add new images
            for (int i = 0; i < request.getImages().size(); i++) {
                String imgUrl = request.getImages().get(i);
                if (imgUrl != null && !imgUrl.isBlank()) {
                    com.badminton.booking.entity.CourtImage imageEntity = com.badminton.booking.entity.CourtImage
                            .builder()
                            .court(court)
                            .imageUrl(imgUrl)
                            .displayOrder(i)
                            .isPrimary(i == 0)
                            .build();
                    court.getImages().add(imageEntity);
                }
            }
            
            // Update backward compatibility imageUrl
            if (!court.getImages().isEmpty()) {
                court.setImageUrl(court.getImages().iterator().next().getImageUrl());
            }
        } else if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            // Fallback: If only imageUrl is provided, convert to CourtImage
            court.getImages().clear();
            com.badminton.booking.entity.CourtImage imageEntity = com.badminton.booking.entity.CourtImage
                    .builder()
                    .court(court)
                    .imageUrl(request.getImageUrl())
                    .displayOrder(0)
                    .isPrimary(true)
                    .build();
            court.getImages().add(imageEntity);
        }

        badmintonCourtRepo.save(court);
    }

    // ===== BULK DATA LOADING =====

    /**
     * Lấy price summary cho nhiều courts - 1 query
     */
    private Map<Integer, CourtPriceSummary> getPriceSummaryMap(List<Integer> courtIds) {
        List<Object[]> results = courtPriceRepository.findCourtPriceSummaryByCourtIds(courtIds);
        Map<Integer, CourtPriceSummary> map = new HashMap<>();

        for (Object[] row : results) {
            Integer courtId = (Integer) row[0];
            BigDecimal minPrice = (BigDecimal) row[1];
            BigDecimal maxPrice = (BigDecimal) row[2];
            LocalTime openTime = (LocalTime) row[3];
            LocalTime closeTime = (LocalTime) row[4];

            map.put(courtId, new CourtPriceSummary(minPrice, maxPrice, openTime, closeTime));
        }

        return map;
    }

    /**
     * Lấy tổng booked minutes cho tất cả courts trong ngày - 1 query
     */
    private Map<Integer, Long> getBookedMinutesMap(LocalDate date) {
        // Lấy tất cả booking active trong ngày
        List<Booking> allBookings = bookingRepository.findAllActiveBookingsByDate(date);

        // Group by courtId và tính tổng minutes
        return allBookings.stream()
                .filter(b -> b.getCourt() != null && b.getStartTime() != null && b.getEndTime() != null)
                .collect(Collectors.groupingBy(
                        b -> b.getCourt().getId(),
                        Collectors.summingLong(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes())));
    }

    // ===== RESPONSE BUILDERS =====

    /**
     * Build response cho SINGLE court (dùng cho getById, create)
     * Vẫn cần 4-5 queries nhưng chỉ cho 1 court nên OK
     */
    private BadmintonCourtResponse toEnrichedResponseSingle(BadmintonCourt court) {
        Integer courtId = court.getId();

        BigDecimal minPrice = courtPriceRepository.findMinPriceByCourtId(courtId);
        BigDecimal maxPrice = courtPriceRepository.findMaxPriceByCourtId(courtId);
        LocalTime openTime = courtPriceRepository.findOpenTimeByCourtId(courtId);
        LocalTime closeTime = courtPriceRepository.findCloseTimeByCourtId(courtId);

        boolean isAvailableToday = checkAvailableToday(court, openTime, closeTime);

        return buildResponse(court, minPrice, maxPrice, openTime, closeTime, isAvailableToday);
    }

    /**
     * Build response cho BULK courts (dùng cho getAll)
     * Không query thêm - dùng data từ map
     */
    private BadmintonCourtResponse toEnrichedResponseBulk(
            BadmintonCourt court,
            Map<Integer, CourtPriceSummary> priceSummaryMap,
            Map<Integer, Long> bookedMinutesMap,
            LocalTime now) {

        Integer courtId = court.getId();
        CourtPriceSummary priceSummary = priceSummaryMap.get(courtId);

        BigDecimal minPrice = priceSummary != null ? priceSummary.minPrice : null;
        BigDecimal maxPrice = priceSummary != null ? priceSummary.maxPrice : null;
        LocalTime openTime = priceSummary != null ? priceSummary.openTime : DEFAULT_OPEN_TIME;
        LocalTime closeTime = priceSummary != null ? priceSummary.closeTime : DEFAULT_CLOSE_TIME;

        Long bookedMinutes = bookedMinutesMap.getOrDefault(courtId, 0L);
        boolean isAvailableToday = checkAvailableTodayFast(court, openTime, closeTime, bookedMinutes, now);

        return buildResponse(court, minPrice, maxPrice, openTime, closeTime, isAvailableToday);
    }

    /**
     * Build final response object
     */
    private BadmintonCourtResponse buildResponse(
            BadmintonCourt court,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            LocalTime openTime,
            LocalTime closeTime,
            boolean isAvailableToday) {

        return BadmintonCourtResponse.builder()
                .id(court.getId())
                .name(court.getName())
                .status(court.getStatus() != null ? court.getStatus().name() : null)
                .type(court.getType() != null ? court.getType().name() : null)
                .location(court.getLocation())
                .description(court.getDescription())
                .imageUrl(court.getImageUrl())
                .capacity(court.getCapacity())
                .minPricePerHour(minPrice)
                .maxPricePerHour(maxPrice)
                .openTime(openTime != null ? openTime : DEFAULT_OPEN_TIME)
                .closeTime(closeTime != null ? closeTime : DEFAULT_CLOSE_TIME)
                .isAvailableToday(isAvailableToday)
                .images(mapImages(court))
                .build();
    }

    private java.util.List<String> mapImages(BadmintonCourt court) {
        if (court.getImages() != null && !court.getImages().isEmpty()) {
            return court.getImages().stream()
                    .sorted(Comparator.comparingInt(com.badminton.booking.entity.CourtImage::getDisplayOrder))
                    .map(com.badminton.booking.entity.CourtImage::getImageUrl)
                    .collect(Collectors.toList());
        }
        if (court.getImageUrl() != null && !court.getImageUrl().isEmpty()) {
            return Collections.singletonList(court.getImageUrl());
        }
        return new ArrayList<>();
    }

    // ===== AVAILABILITY CHECK =====

    /**
     * Check available cho single court (query booking)
     */
    private boolean checkAvailableToday(BadmintonCourt court, LocalTime openTime, LocalTime closeTime) {
        if (court.getStatus() != CourtStatus.ACTIVE) {
            return false;
        }

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        LocalTime effectiveClose = closeTime != null ? closeTime : DEFAULT_CLOSE_TIME;

        if (now.isAfter(effectiveClose)) {
            return false;
        }

        List<Booking> todayBookings = bookingRepository.findActiveBookingsByCourtAndDate(court.getId(), today, null);

        long totalBookedMinutes = todayBookings.stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .mapToLong(b -> Duration.between(b.getStartTime(), b.getEndTime()).toMinutes())
                .sum();

        LocalTime effectiveStart = (openTime != null && now.isAfter(openTime)) ? now
                : (openTime != null ? openTime : DEFAULT_OPEN_TIME);

        if (effectiveStart.isAfter(effectiveClose)) {
            return false;
        }

        long totalOperatingMinutes = Duration.between(effectiveStart, effectiveClose).toMinutes();
        return (totalOperatingMinutes - totalBookedMinutes) >= MIN_AVAILABLE_MINUTES;
    }

    /**
     * Check available NHANH cho bulk (không query, dùng data có sẵn)
     */
    private boolean checkAvailableTodayFast(
            BadmintonCourt court,
            LocalTime openTime,
            LocalTime closeTime,
            Long bookedMinutes,
            LocalTime now) {

        if (court.getStatus() != CourtStatus.ACTIVE) {
            return false;
        }

        LocalTime effectiveClose = closeTime != null ? closeTime : DEFAULT_CLOSE_TIME;
        if (now.isAfter(effectiveClose)) {
            return false;
        }

        LocalTime effectiveOpen = openTime != null ? openTime : DEFAULT_OPEN_TIME;
        LocalTime effectiveStart = now.isAfter(effectiveOpen) ? now : effectiveOpen;

        if (effectiveStart.isAfter(effectiveClose)) {
            return false;
        }

        long totalOperatingMinutes = Duration.between(effectiveStart, effectiveClose).toMinutes();
        long availableMinutes = totalOperatingMinutes - (bookedMinutes != null ? bookedMinutes : 0);

        return availableMinutes >= MIN_AVAILABLE_MINUTES;
    }

    // ===== INNER CLASS =====

    /**
     * DTO nội bộ để cache price summary
     */
    private static class CourtPriceSummary {
        final BigDecimal minPrice;
        final BigDecimal maxPrice;
        final LocalTime openTime;
        final LocalTime closeTime;

        CourtPriceSummary(BigDecimal minPrice, BigDecimal maxPrice, LocalTime openTime, LocalTime closeTime) {
            this.minPrice = minPrice;
            this.maxPrice = maxPrice;
            this.openTime = openTime;
            this.closeTime = closeTime;
        }
    }

    // ===== GET COURT DETAIL - API MỚI =====

    @Override
    @Transactional(readOnly = true)
    public CourtDetailResponse getCourtDetail(Integer courtId, LocalDate date) {
        // Nếu không truyền date, dùng hôm nay
        if (date == null) {
            date = LocalDate.now();
        }

        // 1. Lấy thông tin sân (Eager load images)
        BadmintonCourt court = badmintonCourtRepo.findByIdWithImages(courtId)
                .orElseThrow(() -> new RuntimeException("Badminton court not found with id: " + courtId));

        // 2. Lấy bảng giá (1 query)
        List<CourtPrice> allPrices = courtPriceRepository.findByCourtIdAndIsActiveTrue(courtId);

        // 3. Lấy bookings trong ngày (1 query)
        final LocalDate finalDate = date;
        List<Booking> bookingsOnDate = bookingRepository.findActiveBookingsByCourtAndDate(courtId, date, null);

        // Tách theo WEEKDAY và WEEKEND - truyền thêm bookings và date để tính status
        List<CourtDetailResponse.PriceInfo> weekdayPrices = allPrices.stream()
                .filter(p -> p.getDayType() == DayType.WEEKDAY)
                .sorted(Comparator.comparing(CourtPrice::getStartTime))
                .map(p -> toPriceInfo(p, bookingsOnDate, finalDate))
                .collect(Collectors.toList());

        List<CourtDetailResponse.PriceInfo> weekendPrices = allPrices.stream()
                .filter(p -> p.getDayType() == DayType.WEEKEND)
                .sorted(Comparator.comparing(CourtPrice::getStartTime))
                .map(p -> toPriceInfo(p, bookingsOnDate, finalDate))
                .collect(Collectors.toList());

        // Tính min/max price
        BigDecimal minPrice = allPrices.stream()
                .map(CourtPrice::getPricePerHour)
                .min(BigDecimal::compareTo)
                .orElse(null);

        BigDecimal maxPrice = allPrices.stream()
                .map(CourtPrice::getPricePerHour)
                .max(BigDecimal::compareTo)
                .orElse(null);

        // Tính open/close time
        LocalTime openTime = allPrices.stream()
                .map(CourtPrice::getStartTime)
                .min(LocalTime::compareTo)
                .orElse(DEFAULT_OPEN_TIME);

        LocalTime closeTime = allPrices.stream()
                .map(CourtPrice::getEndTime)
                .max(LocalTime::compareTo)
                .orElse(DEFAULT_CLOSE_TIME);

        // 4. Tính available slots
        List<CourtDetailResponse.AvailableSlot> availableSlots = calculateAvailableSlots(
                openTime, closeTime, bookingsOnDate, date);

        // 5. Tính thống kê
        int totalBookings = bookingsOnDate.size();
        int totalAvailableMinutes = availableSlots.stream()
                .mapToInt(CourtDetailResponse.AvailableSlot::getDurationMinutes)
                .sum();

        boolean isAvailable = totalAvailableMinutes >= MIN_AVAILABLE_MINUTES;

        return CourtDetailResponse.builder()
                .id(court.getId())
                .name(court.getName())
                .status(court.getStatus() != null ? court.getStatus().name() : null)
                .type(court.getType() != null ? court.getType().name() : null)
                .location(court.getLocation())
                .description(court.getDescription())
                .imageUrl(court.getImageUrl())
                .images(mapImages(court))
                .capacity(court.getCapacity())
                .minPricePerHour(minPrice)
                .maxPricePerHour(maxPrice)
                .openTime(openTime)
                .closeTime(closeTime)
                .weekdayPrices(weekdayPrices)
                .weekendPrices(weekendPrices)
                .today(date)
                .isAvailableToday(isAvailable)
                .availableSlotsToday(availableSlots)
                .totalBookingsToday(totalBookings)
                .totalAvailableMinutesToday(totalAvailableMinutes)
                .build();
    }

    private CourtDetailResponse.PriceInfo toPriceInfo(CourtPrice price, List<Booking> bookings, LocalDate date) {
        String status = "AVAILABLE";

        // Nếu có booking trong khoảng thời gian này, đánh dấu là BOOKED
        for (Booking booking : bookings) {
            if (booking.getStartTime() != null && booking.getEndTime() != null) {
                LocalTime bookingStart = booking.getStartTime();
                LocalTime bookingEnd = booking.getEffectiveEndTime(); // Bao gồm buffer

                // Kiểm tra chồng lấp thời gian
                if (isTimeOverlapping(price.getStartTime(), price.getEndTime(), bookingStart, bookingEnd)) {
                    status = "BOOKED";
                    break;
                }
            }
        }

        // Kiểm tra nếu là ngày hôm nay và khung giờ đã qua
        if (date.equals(LocalDate.now())) {
            LocalTime now = LocalTime.now();
            if (price.getEndTime() != null && (price.getEndTime().isBefore(now) || price.getEndTime().equals(now))) {
                status = "PASSED";
            }
        }

        return CourtDetailResponse.PriceInfo.builder()
                .startTime(price.getStartTime())
                .endTime(price.getEndTime())
                .pricePerHour(price.getPricePerHour())
                .periodName(getPeriodName(price.getStartTime()))
                .status(status)
                .build();
    }

    private boolean isTimeOverlapping(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        if (start1 == null || end1 == null || start2 == null || end2 == null) {
            return false;
        }
        return (start1.isBefore(end2) && end1.isAfter(start2));
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

    private List<CourtDetailResponse.AvailableSlot> calculateAvailableSlots(
            LocalTime openTime, LocalTime closeTime,
            List<Booking> bookings, LocalDate date) {

        List<CourtDetailResponse.AvailableSlot> slots = new ArrayList<>();

        // Sort bookings by start time
        List<Booking> sorted = bookings.stream()
                .filter(b -> b.getStartTime() != null && b.getEndTime() != null)
                .sorted(Comparator.comparing(Booking::getStartTime))
                .collect(Collectors.toList());

        // Nếu là hôm nay và đã qua giờ mở cửa, bắt đầu từ giờ hiện tại
        LocalTime now = LocalTime.now();
        LocalTime currentStart = openTime;
        if (date.equals(LocalDate.now()) && now.isAfter(openTime)) {
            currentStart = now.plusMinutes(1); // Làm tròn lên 1 phút
        }

        for (Booking booking : sorted) {
            LocalTime bookingStart = booking.getStartTime();
            LocalTime bookingEnd = booking.getEffectiveEndTime(); // Bao gồm buffer

            // Skip bookings missing effective end
            if (bookingStart == null || bookingEnd == null) {
                continue;
            }

            // Gap trước booking này
            if (currentStart.isBefore(bookingStart)) {
                int gap = (int) Duration.between(currentStart, bookingStart).toMinutes();
                if (gap >= MIN_AVAILABLE_MINUTES) {
                    slots.add(CourtDetailResponse.AvailableSlot.builder()
                            .startTime(currentStart)
                            .endTime(bookingStart)
                            .durationMinutes(gap)
                            .build());
                }
            }

            // Di chuyển currentStart đến sau booking
            if (bookingEnd.isAfter(currentStart)) {
                currentStart = bookingEnd;
            }
        }

        // Gap sau booking cuối cùng đến giờ đóng cửa
        if (currentStart.isBefore(closeTime)) {
            int gap = (int) Duration.between(currentStart, closeTime).toMinutes();
            if (gap >= MIN_AVAILABLE_MINUTES) {
                slots.add(CourtDetailResponse.AvailableSlot.builder()
                        .startTime(currentStart)
                        .endTime(closeTime)
                        .durationMinutes(gap)
                        .build());
            }
        }

        return slots;
    }

    // ===== FILTER COURTS =====

    @Override
    @Transactional(readOnly = true)
    public Slice<BadmintonCourtResponse> filterCourts(
            BigDecimal minPrice,
            BigDecimal maxPrice,
            List<com.badminton.booking.entity.enums.CourtType> types,
            com.badminton.booking.entity.enums.CourtStatus status,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);

        // Use default status if not provided
        if (status == null) {
            status = CourtStatus.ACTIVE;
        }

        // Build specification using CourtSpecification
        com.badminton.booking.specification.CourtSpecification spec = new com.badminton.booking.specification.CourtSpecification();
        org.springframework.data.jpa.domain.Specification<BadmintonCourt> filterSpec = com.badminton.booking.specification.CourtSpecification
                .buildFilterSpec(types, status, minPrice, maxPrice);

        // Query with specification
        Slice<BadmintonCourt> filteredCourts = badmintonCourtRepo.findAll(filterSpec, pageable);

        if (filteredCourts.isEmpty()) {
            return new SliceImpl<>(Collections.emptyList(), pageable, false);
        }

        // ===== TỐI ƯU: Tái sử dụng bulk optimization giống getAllBadmintonCourts =====
        List<BadmintonCourt> courts = filteredCourts.getContent();
        List<Integer> courtIds = courts.stream().map(BadmintonCourt::getId).collect(Collectors.toList());

        // Query 1: Lấy price summary
        Map<Integer, CourtPriceSummary> priceSummaryMap = getPriceSummaryMap(courtIds);

        // Query 2: Lấy booking summary
        LocalDate today = LocalDate.now();
        Map<Integer, Long> bookedMinutesMap = getBookedMinutesMap(today);

        // Build response
        LocalTime now = LocalTime.now();
        List<BadmintonCourtResponse> enrichedList = courts.stream()
                .map(court -> toEnrichedResponseBulk(court, priceSummaryMap, bookedMinutesMap, now))
                .collect(Collectors.toList());

        log.debug("filterCourts: {} courts loaded with specification + 3 bulk queries", courts.size());

        return new SliceImpl<>(enrichedList, pageable, filteredCourts.hasNext());
    }
}
