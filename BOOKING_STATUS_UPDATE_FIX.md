# Booking Status Update - Network Error Fix

## Problem
The admin booking management page was getting a "Network Error" when trying to update booking status using PATCH requests to `/api/bookings/{id}/status?status={status}`.

## Root Cause
The CORS configuration in `SecurityConfig.java` was missing the **PATCH** HTTP method. It only allowed:
- GET
- POST
- PUT
- DELETE
- OPTIONS

But the API endpoint requires **PATCH** method.

## Solution
Added `PATCH` to the allowed methods in the CORS configuration:

```java
// Before:
configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

// After:
configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
```

## Files Changed
- `backend/src/main/java/com/badminton/booking/security/SecurityConfig.java`

## Testing

### Option 1: Test with HTML File
1. Open `frontend/test-update-booking-status.html` in your browser
2. Click "Test Login (admin/admin123)" to get a token
3. Enter a booking ID (e.g., 5, 6, or 7)
4. Select the new status (e.g., CONFIRMED)
5. Make sure "PATCH" is selected as the HTTP method
6. Click "Update Status"
7. You should see a success response

### Option 2: Test in the Admin UI
1. Navigate to `http://localhost:3000/admin/booking-management`
2. Find a booking with status PENDING
3. Click the "Xác nhận" (Confirm) button
4. Confirm the action in the dialog
5. The booking status should update to CONFIRMED

## Status Flow
- **PENDING** → Can change to CONFIRMED or CANCELLED
- **CONFIRMED** → Can change to PLAYING or CANCELLED
- **PLAYING** → Can change to COMPLETED or extend time
- **COMPLETED** → Final state
- **CANCELLED** → Final state

## API Endpoints
- Update status: `PATCH /api/bookings/{id}/status?status={status}`
- Extend booking: `POST /api/bookings/{id}/extend`

## Backend Status
✅ Backend restarted with updated CORS configuration
✅ Running on port 8080
✅ PATCH method now allowed from frontend (localhost:3000)
