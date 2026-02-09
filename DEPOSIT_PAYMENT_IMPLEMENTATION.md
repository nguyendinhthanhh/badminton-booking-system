# 💰 DEPOSIT PAYMENT & AUTO-CANCEL IMPLEMENTATION

## 📋 Tổng quan
Hệ thống thanh toán deposit (1/3 tiền cọc) và tự động hủy booking nếu không check-in sau 20 phút.

---

## ✅ BACKEND IMPLEMENTATION

### 1. Database Migration
**File:** `backend/src/main/resources/db/migration/V8__add_deposit_and_auto_cancel_fields.sql`

Thêm các fields:
- `deposit_amount` - Số tiền cọc (1/3 tổng tiền)
- `deposit_paid` - Số tiền đã thanh toán
- `remaining_amount` - Số tiền còn lại
- `deposit_required` - Flag yêu cầu cọc
- `check_in_deadline` - Deadline check-in (startTime + 20 phút)

### 2. Entity Updates
**File:** `backend/src/main/java/com/badminton/booking/entity/Booking.java`

Thêm fields deposit và check-in deadline vào Booking entity.

### 3. New Status
**File:** `backend/src/main/java/com/badminton/booking/entity/enums/BookingStatusEnum.java`

Thêm status mới:
- `PENDING_PAYMENT` - Chờ thanh toán deposit
- `PAYMENT_CONFIRMED` - Đã thanh toán deposit, chờ check-in
- `NO_SHOW` - Không check-in đúng giờ

### 4. DTOs
**Files:**
- `DepositPaymentRequest.java` - Request thanh toán deposit
- `BookingResponse.java` - Thêm deposit fields vào response

### 5. Services
**Files:**
- `PaymentService.java` - Interface
- `PaymentServiceImpl.java` - Implementation
  - `payDeposit()` - Thanh toán deposit
  - `payRemaining()` - Thanh toán phần còn lại

### 6. Controller
**File:** `PaymentController.java`

Endpoints:
- `POST /api/payments/deposit` - Thanh toán deposit
- `POST /api/payments/remaining/{bookingId}` - Thanh toán phần còn lại

### 7. Booking Service Update
**File:** `BookingServiceImpl.java`

Update `createBooking()`:
- Tính deposit = totalPrice / 3
- Tính remaining = totalPrice - deposit
- Set check-in deadline = startTime + 20 phút
- Set status = PENDING_PAYMENT

### 8. Scheduled Job
**File:** `BookingAutoCancelScheduler.java`

- Chạy mỗi 5 phút
- Tìm booking đã qua deadline mà chưa check-in
- Tự động hủy và set status = NO_SHOW
- Log và có thể gửi notification

### 9. Enable Scheduling
**File:** `BadmintonBookingApplication.java`

Thêm `@EnableScheduling` annotation.

---

## 🎨 FRONTEND IMPLEMENTATION

### 1. Payment Service
**File:** `frontend/src/services/paymentService.js`

Methods:
- `payDeposit(depositData)` - Thanh toán deposit
- `payRemaining(bookingId, paymentMethod)` - Thanh toán phần còn lại

### 2. Payment Modal Component
**File:** `frontend/src/components/customer/PaymentModal.jsx`

Features:
- Hiển thị breakdown: Tổng tiền / Cọc / Còn lại
- Warning box về policy check-in
- Chọn phương thức thanh toán (Cash, Bank Transfer, MoMo, VNPay)
- Loading state và error handling

### 3. Check-in Countdown Component
**File:** `frontend/src/components/customer/CheckInCountdown.jsx`

Features:
- Real-time countdown đến deadline check-in
- Màu sắc thay đổi theo thời gian còn lại:
  - Blue: Còn > 10 phút
  - Amber (pulsing): Còn < 10 phút
  - Red: Đã hết hạn
- Chỉ hiển thị cho status PAYMENT_CONFIRMED hoặc CONFIRMED

### 4. Court Details Update
**File:** `frontend/src/pages/customer/CourtDetails.jsx`

Changes:
- Import PaymentModal
- Thêm state: `showPaymentModal`, `pendingBooking`
- Update `handleBooking()`:
  - Sau khi tạo booking thành công → Hiển thị Payment Modal
  - Không redirect ngay
- Thêm `handlePaymentSuccess()`:
  - Đóng modal
  - Reset form
  - Refresh data
  - Redirect to My Bookings

### 5. Booking Card Update
**File:** `frontend/src/components/customer/BookingCard.jsx`

Changes:
- Import CheckInCountdown
- Hiển thị CheckInCountdown trong header
- Hiển thị deposit info:
  - Đã cọc: XXX VNĐ
  - Còn lại: XXX VNĐ

### 6. My Bookings Update
**File:** `frontend/src/pages/customer/MyBookings.jsx`

Changes:
- Import CheckInCountdown
- Component tự động hiển thị countdown trong BookingCard

---

## 🔄 BOOKING FLOW

### Online Booking Flow:
1. User chọn sân, giờ chơi
2. Hệ thống tính giá và deposit (1/3)
3. User bấm "Đặt sân"
4. Backend tạo booking với status = PENDING_PAYMENT
5. Frontend hiển thị Payment Modal
6. User chọn phương thức và thanh toán deposit
7. Backend update status = PAYMENT_CONFIRMED
8. Set check-in deadline = startTime + 20 phút
9. User thấy countdown timer trong My Bookings
10. User phải check-in trước deadline
11. Nếu không check-in → Scheduled job tự động hủy

### Walk-in Booking Flow:
- Admin tạo booking trực tiếp
- Không yêu cầu deposit
- Status = CONFIRMED ngay

---

## ⚙️ CONFIGURATION

### Scheduled Job
- Cron: `0 */5 * * * *` (mỗi 5 phút)
- Có thể thay đổi trong `BookingAutoCancelScheduler.java`

### Deposit Ratio
- Hiện tại: 1/3 (33.33%)
- Có thể thay đổi trong `BookingServiceImpl.java`:
  ```java
  BigDecimal depositAmount = totalPrice.divide(new BigDecimal("3"), ...);
  ```

### Check-in Deadline
- Hiện tại: 20 phút sau startTime
- Có thể thay đổi trong `BookingServiceImpl.java`:
  ```java
  LocalDateTime checkInDeadline = LocalDateTime.of(playDate, startTime).plusMinutes(20);
  ```

---

## 🧪 TESTING

### Backend Testing:
1. Tạo booking mới → Check deposit_amount = totalPrice / 3
2. Thanh toán deposit → Check status = PAYMENT_CONFIRMED
3. Đợi qua deadline → Check scheduled job tự động hủy
4. Check logs để verify

### Frontend Testing:
1. Đặt sân → Payment Modal hiển thị đúng
2. Thanh toán → Redirect to My Bookings
3. Check countdown timer hoạt động
4. Check deposit info hiển thị đúng

---

## 📝 NOTES

### Refund Policy (TODO):
- Hiện tại chưa implement refund logic
- Có thể thêm trong `BookingAutoCancelScheduler`:
  - Giữ 100% deposit nếu NO_SHOW
  - Hoặc refund 50% deposit
  - Tùy business logic

### Notification (TODO):
- Gửi email/SMS khi thanh toán thành công
- Gửi reminder 30 phút trước giờ chơi
- Gửi warning 10 phút trước deadline check-in
- Gửi notification khi bị auto-cancel

### Payment Gateway Integration (TODO):
- Hiện tại chỉ mock payment
- Cần integrate với MoMo, VNPay API
- Xử lý callback và webhook

---

## 🚀 DEPLOYMENT

### Database Migration:
```bash
# Migration sẽ tự động chạy khi start backend
# Hoặc chạy manual:
mvn flyway:migrate
```

### Backend:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## ✨ FEATURES SUMMARY

✅ Thanh toán deposit 1/3 tiền cọc
✅ Tự động hủy nếu không check-in sau 20 phút
✅ Real-time countdown timer
✅ Payment modal với multiple payment methods
✅ Deposit info hiển thị trong booking card
✅ Scheduled job tự động chạy mỗi 5 phút
✅ Status lifecycle: PENDING_PAYMENT → PAYMENT_CONFIRMED → PLAYING → COMPLETED
✅ NO_SHOW status cho booking không check-in

---

## 📞 SUPPORT

Nếu có vấn đề, check:
1. Backend logs: `backend/backend.log`
2. Scheduled job logs: Search "Auto-cancel" trong logs
3. Database: Check `bookings` table với status = NO_SHOW
4. Frontend console: Check payment errors

---

**Implementation Date:** 2024
**Version:** 1.0.0
**Status:** ✅ Complete
