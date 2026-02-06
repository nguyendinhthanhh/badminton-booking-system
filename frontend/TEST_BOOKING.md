# Test Booking Integration

## ✅ Files đã cập nhật:

1. ✅ `frontend/src/services/bookingService.js` - Service để gọi API booking
2. ✅ `frontend/src/pages/customer/CourtDetails.jsx` - Trang chi tiết sân với tính năng booking

## 🧪 Cách test:

### 1. Kiểm tra trong browser:

1. Mở http://localhost:3000/courts/17
2. Mở DevTools (F12) → Console tab
3. Chọn một hoặc nhiều khung giờ (ví dụ: "Sáng sớm 06:00-08:00")
4. Click button "Tiếp tục đặt sân"
5. Xem console log để check request

### 2. Test API trực tiếp:

```javascript
// Paste vào browser console
fetch('http://localhost:8080/api/bookings?userId=1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    courtId: 17,
    playDate: '2026-02-05',
    startTime: { hour: 6, minute: 0, second: 0, nano: 0 },
    endTime: { hour: 8, minute: 0, second: 0, nano: 0 },
    notes: 'Test booking'
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

## 🔧 Nếu không thấy button:

1. **Hard refresh**: Ctrl + Shift + R
2. **Clear Vite cache**:
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   npm run dev
   ```
3. **Check console errors**: F12 → Console tab

## 📝 Request Format:

```json
{
  "courtId": 17,
  "playDate": "2026-02-05",
  "startTime": {
    "hour": 6,
    "minute": 0,
    "second": 0,
    "nano": 0
  },
  "endTime": {
    "hour": 8,
    "minute": 0,
    "second": 0,
    "nano": 0
  },
  "notes": "Đặt 1 khung giờ"
}
```

## 🎯 Expected Response:

```json
{
  "bookingId": 123,
  "courtId": 17,
  "courtName": "Court 1",
  "customerId": 1,
  "customerName": "...",
  "playDate": "2026-02-05",
  "startTime": {...},
  "endTime": {...},
  "status": "PENDING",
  "totalPrice": 60000,
  ...
}
```
