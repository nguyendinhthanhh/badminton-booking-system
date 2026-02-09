# Test Instructions: Booking Status Update Feature

## What Was Fixed
The booking status update feature was failing with "Network Error" because the backend CORS configuration didn't allow PATCH requests. This has been fixed by adding PATCH to the allowed HTTP methods.

## Prerequisites
- ✅ Backend is running on port 8080
- ✅ Frontend is running on port 3000
- ✅ You have admin credentials (username: admin, password: admin123)
- ✅ There are existing bookings in the database (IDs: 5, 6, 7)

## Test Method 1: Using the Admin UI (Recommended)

### Step 1: Login as Admin
1. Open browser and go to `http://localhost:3000`
2. Click "Đăng nhập" (Login)
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. Click "Đăng nhập"

### Step 2: Navigate to Booking Management
1. After login, you should be redirected to admin dashboard
2. Click on "Quản lý Booking" in the left sidebar
3. You should see the booking management page with filters and a table

### Step 3: Test Status Updates

#### Test Case 1: PENDING → CONFIRMED
1. Find a booking with status "PENDING" (yellow badge)
2. Click the blue "Xác nhận" (Confirm) button
3. A confirmation dialog should appear
4. Click "Xác nhận" to confirm
5. ✅ Expected: Status changes to "CONFIRMED" (blue badge)
6. ✅ Expected: Success message appears at the top
7. ✅ Expected: Table refreshes automatically

#### Test Case 2: CONFIRMED → PLAYING
1. Find a booking with status "CONFIRMED" (blue badge)
2. Click the purple "Chơi" (Play) button
3. Confirm the action in the dialog
4. ✅ Expected: Status changes to "PLAYING" (purple badge)
5. ✅ Expected: New buttons appear: "Gia hạn" (Extend) and "Xong" (Complete)

#### Test Case 3: PLAYING → COMPLETED
1. Find a booking with status "PLAYING" (purple badge)
2. Click the green "Xong" (Complete) button
3. Confirm the action in the dialog
4. ✅ Expected: Status changes to "COMPLETED" (green badge)
5. ✅ Expected: No more action buttons (final state)

#### Test Case 4: PENDING/CONFIRMED → CANCELLED
1. Find a booking with status "PENDING" or "CONFIRMED"
2. Click the red cancel icon (X button)
3. Confirm the cancellation in the dialog
4. ✅ Expected: Status changes to "CANCELLED" (red badge)
5. ✅ Expected: No more action buttons (final state)

### Step 4: Test Extend Booking (Optional)
1. Find a booking with status "PLAYING"
2. Click the indigo "Gia hạn" (Extend) button
3. A modal should appear with extension options
4. Select extension duration (15-180 minutes)
5. Click "Xác nhận gia hạn"
6. ✅ Expected: Booking end time is extended
7. ✅ Expected: Success message appears

## Test Method 2: Using the Test HTML File

### Step 1: Open Test File
1. Open `frontend/test-update-booking-status.html` in your browser
2. You should see a test form

### Step 2: Get Authentication Token
**Option A: From LocalStorage**
1. Make sure you're logged in on `http://localhost:3000`
2. Click "Get Token from LocalStorage" button
3. Token should appear in the input field

**Option B: Test Login**
1. Click "Test Login (admin/admin123)" button
2. Token should appear in the input field

### Step 3: Test Status Update
1. Enter Booking ID: `5` (or any existing booking ID)
2. Select New Status: `CONFIRMED`
3. Make sure HTTP Method is: `PATCH`
4. Make sure Endpoint is: `/api/bookings/{id}/status`
5. Click "Update Status"
6. ✅ Expected: Green success message with response data
7. ❌ If error: Check console for details

### Step 4: Verify in Database or UI
1. Go back to `http://localhost:3000/admin/booking-management`
2. Find the booking you just updated
3. ✅ Expected: Status should be changed

## Troubleshooting

### Error: "Network Error"
- ✅ **FIXED**: Backend CORS now allows PATCH method
- Check: Is backend running on port 8080?
- Check: Is frontend running on port 3000?
- Check: Browser console for CORS errors

### Error: "401 Unauthorized"
- Token might be expired
- Try logging in again
- Check token in browser DevTools → Application → Local Storage

### Error: "403 Forbidden"
- User doesn't have admin permissions
- Make sure you're logged in as admin

### Error: "404 Not Found"
- Booking ID doesn't exist
- Try with booking IDs: 5, 6, or 7

### Error: "400 Bad Request"
- Invalid status transition
- Check status flow: PENDING → CONFIRMED → PLAYING → COMPLETED
- Can only CANCEL from PENDING or CONFIRMED

## Status Flow Reference

```
PENDING
  ├─→ CONFIRMED
  │     ├─→ PLAYING
  │     │     └─→ COMPLETED ✓
  │     └─→ CANCELLED ✓
  └─→ CANCELLED ✓
```

## API Endpoints Used

1. **Update Status**: `PATCH /api/bookings/{id}/status?status={status}`
2. **Extend Booking**: `POST /api/bookings/{id}/extend`
3. **Get All Bookings**: `GET /api/admin/bookings?page=0&size=20`

## Files Modified

### Backend
- `backend/src/main/java/com/badminton/booking/security/SecurityConfig.java`
  - Added PATCH to allowed CORS methods

### Frontend
- `frontend/src/services/adminBookingService.js`
  - Added better error logging
- `frontend/test-update-booking-status.html`
  - Added token helper functions
  - Improved UI for testing

## Next Steps

After confirming the status update works:
1. Test the extend booking feature
2. Test payment status updates
3. Test with different user roles
4. Test error cases (invalid transitions)
