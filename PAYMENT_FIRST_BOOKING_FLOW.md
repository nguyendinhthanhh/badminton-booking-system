# Payment-First Booking Flow

## Yêu cầu
User phải thanh toán deposit (1/3 tổng tiền) TRƯỚC khi booking được tạo thành công.

## Flow Mới

### 1. User chọn giờ và kiểm tra khả dụng
- User chọn ngày, giờ bắt đầu, giờ kết thúc
- Bấm "Kiểm tra khả dụng"
- Hệ thống hiển thị:
  - Trạng thái khả dụng (Available/Not Available)
  - Tổng tiền
  - Số tiền cọc (1/3)

### 2. User bấm "Thanh toán để đặt sân"
- Hệ thống hiển thị Payment Modal
- Modal hiển thị:
  - Thông tin booking (ngày, giờ)
  - Tổng tiền
  - Số tiền cọc cần thanh toán (1/3)
  - Số tiền còn lại (2/3)
  - Deadline check-in (startTime + 20 phút)
  - Cảnh báo: Nếu quá 20 phút chưa check-in → Tự động hủy
- User chọn phương thức thanh toán:
  - CASH (Tiền mặt)
  - BANK_TRANSFER (Chuyển khoản)
  - MOMO
  - VNPAY

### 3. User xác nhận thanh toán
- Hệ thống:
  1. Tạo booking (POST /api/bookings)
  2. Thanh toán deposit (POST /api/payments/deposit)
  3. Booking status = CONFIRMED
  4. Hiển thị thông báo thành công
  5. Redirect đến My Bookings

### 4. Nếu thanh toán thất bại
- Không tạo booking
- Hiển thị lỗi
- User có thể thử lại

## So sánh với Flow Cũ

### Flow Cũ (Sai)
```
User chọn giờ 
→ Bấm "Tiếp tục đặt sân" 
→ Tạo booking (status = PENDING_PAYMENT)
→ Hiển thị Payment Modal
→ User thanh toán
→ Update status = CONFIRMED
```

**Vấn đề**: Booking đã được tạo trước khi thanh toán, có thể gây ra:
- Booking tồn tại nhưng chưa thanh toán
- Khó quản lý các booking chưa thanh toán
- User có thể bỏ qua thanh toán

### Flow Mới (Đúng)
```
User chọn giờ 
→ Bấm "Thanh toán để đặt sân"
→ Hiển thị Payment Modal
→ User chọn phương thức và xác nhận
→ Tạo booking + Thanh toán deposit (atomic)
→ Booking status = CONFIRMED ngay lập tức
```

**Ưu điểm**:
- Booking chỉ được tạo khi đã thanh toán
- Không có booking "rác" (pending payment)
- Flow rõ ràng: Thanh toán → Đặt sân thành công
- Đảm bảo user cam kết thanh toán trước khi chiếm slot

## Technical Implementation

### Frontend Changes

#### 1. CourtDetails.jsx
```javascript
// Thay đổi handleBooking - không tạo booking ngay
const handleBooking = async () => {
  // Validation...
  
  // Chuẩn bị data và hiển thị Payment Modal
  const bookingData = {
    courtId: parseInt(id),
    playDate: formatDateString(selectedDate),
    startTime: selectedStartTime,
    endTime: selectedEndTime,
    notes: `Đặt sân từ ${selectedStartTime} đến ${selectedEndTime}`,
    totalPrice: priceResult?.totalPrice || 0,
    depositAmount: Math.round((priceResult?.totalPrice || 0) / 3),
  };

  setPendingBooking(bookingData);
  setShowPaymentModal(true);
};

// Thay đổi handlePaymentSuccess - tạo booking SAU khi user chọn payment method
const handlePaymentSuccess = async (paymentMethod) => {
  // 1. Tạo booking
  const response = await bookingService.createBooking(userId, bookingData);
  
  // 2. Thanh toán deposit
  await paymentService.payDeposit({
    bookingId: response.id,
    amount: pendingBooking.depositAmount,
    paymentMethod: paymentMethod,
  });
  
  // 3. Success handling...
};
```

#### 2. PaymentModal.jsx
```javascript
// Thay đổi handlePayment - gọi onSuccess với paymentMethod
const handlePayment = async () => {
  setLoading(true);
  await onSuccess(selectedMethod); // Parent sẽ tạo booking + payment
  setLoading(false);
};

// Tính toán remainingAmount và checkInDeadline từ bookingData
const remainingAmount = booking.totalPrice - booking.depositAmount;
const checkInDeadline = calculateCheckInDeadline();
```

### Backend (Không thay đổi)
Backend flow vẫn giữ nguyên:
1. POST /api/bookings - Tạo booking với status PENDING_PAYMENT
2. POST /api/payments/deposit - Thanh toán và update status = CONFIRMED

## User Experience

### Trước khi thanh toán
- User thấy rõ số tiền cần thanh toán (1/3)
- User thấy cảnh báo về deadline check-in
- User có thể hủy bỏ trước khi thanh toán

### Sau khi thanh toán
- Booking được tạo ngay lập tức với status CONFIRMED
- User nhận được xác nhận đặt sân thành công
- User được redirect đến My Bookings để xem chi tiết

### Nếu không check-in đúng giờ
- Scheduler tự động hủy booking sau 20 phút
- Status = CANCELLED
- Tiền cọc có thể không được hoàn lại (tùy policy)

## Files Modified

1. `frontend/src/pages/customer/CourtDetails.jsx`
   - Updated `handleBooking()` - Show payment modal instead of creating booking
   - Updated `handlePaymentSuccess()` - Create booking + payment after user confirms
   - Added `paymentService` import
   - Changed button text to "Thanh toán để đặt sân"

2. `frontend/src/components/customer/PaymentModal.jsx`
   - Removed `paymentService` import
   - Updated `handlePayment()` - Call onSuccess with paymentMethod
   - Calculate `remainingAmount` and `checkInDeadline` from bookingData
   - Removed courtName field (not available in bookingData)

## Testing Checklist

- [ ] User chọn giờ → Bấm "Thanh toán để đặt sân" → Modal hiển thị đúng
- [ ] Modal hiển thị đúng tổng tiền, deposit (1/3), remaining (2/3)
- [ ] Modal hiển thị đúng deadline check-in (startTime + 20 phút)
- [ ] User chọn payment method → Bấm "Thanh toán" → Booking được tạo
- [ ] Booking status = CONFIRMED ngay sau khi thanh toán
- [ ] User được redirect đến My Bookings
- [ ] Nếu thanh toán thất bại → Không tạo booking, hiển thị lỗi
- [ ] Nếu user đóng modal → Không tạo booking, có thể thử lại
