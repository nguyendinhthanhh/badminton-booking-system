# My Bookings Feature - Tính năng xem lịch đặt sân

## Tổng quan

Tính năng cho phép khách hàng xem lại tất cả các lần đặt sân của mình với các bộ lọc linh hoạt.

## API Endpoint

```
GET /api/bookings/my-bookings?fromDate=2026-02-05&toDate=2026-02-05
```

### Headers
- `Authorization: Bearer <token>`

### Query Parameters
- `fromDate` (required): Ngày bắt đầu (format: YYYY-MM-DD)
- `toDate` (required): Ngày kết thúc (format: YYYY-MM-DD)

### Response Example
```json
[
  {
    "bookingId": 5,
    "courtId": 17,
    "courtName": "Court 1",
    "courtType": "DOUBLE",
    "customerId": 19,
    "customerName": "Admin User",
    "customerPhone": "0123456789",
    "playDate": "2026-02-05",
    "startTime": "18:00",
    "endTime": "19:00",
    "actualEndTime": null,
    "durationMinutes": 60,
    "bufferMinutes": 10,
    "status": "PENDING",
    "paymentStatus": "UNPAID",
    "basePrice": 120000,
    "overtimeFee": 0,
    "totalPrice": 120000,
    "overtimeMinutes": 0,
    "priceBreakdown": [...],
    "extensions": [],
    "notes": "Đặt sân từ 18:00 đến 19:00",
    "bookingDate": "2026-02-05"
  }
]
```

## Components

### 1. MyBookings Page (`/my-bookings`)
- Trang chính hiển thị danh sách đặt sân
- Bộ lọc theo ngày, trạng thái, thanh toán
- Thống kê tổng quan
- Nhóm theo ngày

### 2. BookingCard Component
- Hiển thị thông tin chi tiết từng booking
- Status badges với màu sắc phân biệt
- Chi tiết giá theo từng khoảng thời gian
- Thông tin gia hạn và phụ phí

### 3. Service Layer
- `myBookingService.js`: Xử lý API calls

## Features

### Bộ lọc
- **Date Range**: Chọn khoảng thời gian
- **Quick Filters**: Hôm nay, 7 ngày, 30 ngày
- **Status Filter**: Tất cả, Pending, Confirmed, Completed, Cancelled
- **Payment Filter**: Tất cả, Paid, Unpaid, Partial, Refunded

### Thống kê
- Tổng số lượt đặt
- Tổng thời gian (phút)
- Tổng chi phí

### Hiển thị
- Nhóm theo ngày
- Card layout responsive
- Color-coded status badges
- Price breakdown details
- Extension information
- Overtime fees

## Status Colors

### Booking Status
- `PENDING`: Yellow (Chờ xác nhận)
- `CONFIRMED`: Blue (Đã xác nhận)
- `COMPLETED`: Green (Hoàn thành)
- `CANCELLED`: Red (Đã hủy)
- `CHECKED_IN`: Purple (Đã check-in)

### Payment Status
- `PAID`: Green (Đã thanh toán)
- `UNPAID`: Red (Chưa thanh toán)
- `PARTIAL`: Yellow (Thanh toán một phần)
- `REFUNDED`: Gray (Đã hoàn tiền)

## Navigation

Truy cập tính năng qua:
1. Header dropdown menu → "Lịch đặt sân"
2. Direct URL: `/my-bookings`

## Testing

Sử dụng file `test-my-bookings.html` để test API:
1. Mở file trong browser
2. Nhập Bearer token
3. Chọn date range
4. Click "Fetch My Bookings"

## Dependencies

- `lucide-react`: Icons
- `axios`: HTTP client
- `react-router-dom`: Routing
- `zustand`: State management (auth)

## Installation

```bash
cd frontend
npm install lucide-react
```

## Usage

```jsx
import { Link } from 'react-router-dom';

// In your component
<Link to="/my-bookings">Xem lịch đặt sân</Link>
```

## Protected Route

Route này yêu cầu authentication. User phải đăng nhập để truy cập.

```jsx
<Route element={<ProtectedRoute redirectPath="/login" />}>
  <Route path="/my-bookings" element={<MyBookings />} />
</Route>
```
