# BOOKING API - Ví dụ Input/Output

## 1. CHECK AVAILABILITY (Kiểm tra khung giờ trống)

### Request
```
GET /api/bookings/check-availability?courtId=1&playDate=2026-02-05&startTime=07:00&endTime=10:00
```

### Response - Khung giờ trống
```json
{
  "courtId": 1,
  "courtName": "Sân 1",
  "date": "2026-02-05",
  "requestedStart": "07:00",
  "requestedEnd": "10:00",
  "available": true,
  "message": "Khung giờ trống, có thể đặt sân",
  "conflicts": [],
  "suggestedSlots": []
}
```

### Response - Khung giờ đã có người đặt
```json
{
  "courtId": 1,
  "courtName": "Sân 1",
  "date": "2026-02-05",
  "requestedStart": "07:00",
  "requestedEnd": "10:00",
  "available": false,
  "message": "Khung giờ đã có người đặt, vui lòng chọn giờ khác",
  "conflicts": [
    {
      "bookingId": 15,
      "startTime": "08:00",
      "endTime": "09:30",
      "effectiveEndTime": "09:40",
      "status": "CONFIRMED"
    }
  ],
  "suggestedSlots": [
    {
      "startTime": "06:00",
      "endTime": "08:00",
      "durationMinutes": 120
    },
    {
      "startTime": "09:40",
      "endTime": "22:00",
      "durationMinutes": 740
    }
  ]
}
```

---

## 2. CALCULATE PRICE (Tính giá - tách nhiều khung giá)

### Request
```
GET /api/bookings/calculate-price?courtId=1&playDate=2026-02-05&startTime=07:00&endTime=10:00
```

### Response - Ngày thường (WEEKDAY)
```json
{
  "courtId": 1,
  "courtName": "Sân 1",
  "playDate": "2026-02-05",
  "dayType": "WEEKDAY",
  "startTime": "07:00",
  "endTime": "10:00",
  "totalMinutes": 180,
  "totalPrice": 220000,
  "breakdown": [
    {
      "start": "07:00",
      "end": "08:00",
      "minutes": 60,
      "pricePerHour": 60000,
      "subtotal": 60000,
      "periodName": "Sáng sớm"
    },
    {
      "start": "08:00",
      "end": "10:00",
      "minutes": 120,
      "pricePerHour": 80000,
      "subtotal": 160000,
      "periodName": "Sáng"
    }
  ]
}
```

### Response - Cuối tuần (WEEKEND)
```json
{
  "courtId": 1,
  "courtName": "Sân 1",
  "playDate": "2026-02-07",
  "dayType": "WEEKEND",
  "startTime": "17:00",
  "endTime": "19:30",
  "totalMinutes": 150,
  "totalPrice": 375000,
  "breakdown": [
    {
      "start": "17:00",
      "end": "19:30",
      "minutes": 150,
      "pricePerHour": 150000,
      "subtotal": 375000,
      "periodName": "Giờ vàng"
    }
  ]
}
```

---

## 3. CREATE BOOKING (Tạo booking)

### Request
```
POST /api/bookings?userId=1
Content-Type: application/json

{
  "courtId": 1,
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "10:00",
  "notes": "Đặt sân cho 4 người"
}
```

### Response
```json
{
  "bookingId": 25,
  "courtId": 1,
  "courtName": "Sân 1",
  "courtType": "INDOOR",
  "customerId": 1,
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0901234567",
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "10:00",
  "actualEndTime": null,
  "durationMinutes": 180,
  "bufferMinutes": 10,
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "basePrice": 220000,
  "overtimeFee": 0,
  "totalPrice": 220000,
  "overtimeMinutes": 0,
  "priceBreakdown": [
    {
      "periodStart": "07:00",
      "periodEnd": "08:00",
      "durationMinutes": 60,
      "pricePerHour": 60000,
      "subtotal": 60000,
      "dayType": "WEEKDAY"
    },
    {
      "periodStart": "08:00",
      "periodEnd": "10:00",
      "durationMinutes": 120,
      "pricePerHour": 80000,
      "subtotal": 160000,
      "dayType": "WEEKDAY"
    }
  ],
  "extensions": [],
  "notes": "Đặt sân cho 4 người",
  "bookingDate": "2026-02-04"
}
```

---

## 4. EXTEND BOOKING (Gia hạn)

### Request - Theo số phút
```
POST /api/bookings/25/extend
Content-Type: application/json

{
  "extensionMinutes": 60
}
```

### Request - Theo giờ kết thúc mới
```
POST /api/bookings/25/extend
Content-Type: application/json

{
  "newEndTime": "11:00"
}
```

### Response
```json
{
  "bookingId": 25,
  "courtId": 1,
  "courtName": "Sân 1",
  "playDate": "2026-02-05",
  "startTime": "07:00",
  "endTime": "11:00",
  "durationMinutes": 240,
  "status": "PLAYING",
  "basePrice": 300000,
  "totalPrice": 300000,
  "priceBreakdown": [
    {"periodStart": "07:00", "periodEnd": "08:00", "subtotal": 60000},
    {"periodStart": "08:00", "periodEnd": "11:00", "subtotal": 240000}
  ],
  "extensions": [
    {
      "originalEndTime": "10:00",
      "extendedEndTime": "11:00",
      "extensionMinutes": 60,
      "extensionFee": 80000
    }
  ]
}
```

### Error - Có booking tiếp theo
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Không thể gia hạn - có booking tiếp theo lúc 11:00"
}
```

---

## 5. CALCULATE OVERTIME FEE (Tính phí quá giờ)

### Request
```
GET /api/bookings/25/overtime?actualEndTime=10:25
```

### Response
```json
{
  "bookingId": 25,
  "scheduledEndTime": "10:00",
  "actualEndTime": "10:25",
  "overtimeMinutes": 25,
  "overtimeRate": 1.5,
  "basePricePerHour": 80000,
  "overtimeFee": 50000,
  "message": "Overtime 25 phút, phí: 50000 VND (hệ số x1.5)"
}
```

---

## 6. COMPLETE BOOKING (Check-out)

### Request
```
POST /api/bookings/25/complete?actualEndTime=10:25
```

### Response
```json
{
  "bookingId": 25,
  "startTime": "07:00",
  "endTime": "10:00",
  "actualEndTime": "10:25",
  "status": "COMPLETED",
  "basePrice": 220000,
  "overtimeFee": 50000,
  "totalPrice": 270000,
  "overtimeMinutes": 25
}
```

---

## 7. GET AVAILABLE SLOTS (Lấy khung giờ trống)

### Request
```
GET /api/bookings/court/1/available-slots?date=2026-02-05
```

### Response
```json
[
  {
    "startTime": "06:00",
    "endTime": "08:00",
    "durationMinutes": 120
  },
  {
    "startTime": "11:10",
    "endTime": "14:00",
    "durationMinutes": 170
  },
  {
    "startTime": "16:10",
    "endTime": "22:00",
    "durationMinutes": 350
  }
]
```

---

## 8. BOOKING STATUS FLOW

```
PENDING ──────► CONFIRMED ──────► PLAYING ──────► COMPLETED
    │               │
    │               │
    ▼               ▼
CANCELLED      CANCELLED
```

### Các API cập nhật trạng thái:
- `PATCH /api/bookings/25/status?status=CONFIRMED` - Xác nhận booking
- `POST /api/bookings/25/check-in` - Check-in (CONFIRMED → PLAYING)
- `POST /api/bookings/25/complete?actualEndTime=10:00` - Check-out (PLAYING → COMPLETED)
- `POST /api/bookings/25/cancel?reason=Khách hủy` - Hủy booking

---

## 9. BẢNG GIÁ MẪU

### Ngày thường (WEEKDAY)
| Khung giờ | Tên buổi | Giá/giờ |
|-----------|----------|---------|
| 06:00-08:00 | Sáng sớm | 60,000đ |
| 08:00-11:00 | Sáng | 80,000đ |
| 11:00-14:00 | Trưa | 60,000đ |
| 14:00-17:00 | Chiều | 80,000đ |
| 17:00-21:00 | Giờ vàng | 120,000đ |
| 21:00-22:00 | Tối muộn | 80,000đ |

### Cuối tuần (WEEKEND) - Cao hơn 20-30k
| Khung giờ | Giá/giờ |
|-----------|---------|
| 06:00-08:00 | 80,000đ |
| 08:00-11:00 | 100,000đ |
| 11:00-14:00 | 80,000đ |
| 14:00-17:00 | 100,000đ |
| 17:00-21:00 | 150,000đ |
| 21:00-22:00 | 100,000đ |

---

## 10. OVERLAP CHECK FORMULA

```
Conflict xảy ra khi:
(newStart < existingEnd + buffer) AND (newEnd > existingStart)

Ví dụ:
- Existing booking: 08:00-09:30 (buffer 10 phút → effective end: 09:40)
- New booking 07:00-10:00:
  - 07:00 < 09:40? YES
  - 10:00 > 08:00? YES
  - → CONFLICT!

- New booking 09:40-11:00:
  - 09:40 < 09:40? NO
  - → OK, không conflict
```

