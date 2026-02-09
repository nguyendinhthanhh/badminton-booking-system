# Token Refresh Issue - Fixed

## Problem
Users were experiencing 403 errors when accessing authenticated endpoints after some time, even though they appeared to be logged in. The issue occurred because:

1. **Incorrect Refresh Token Expiration**: The refresh token was expiring after only ~10 minutes instead of 7 days
2. **Inconsistent Error Codes**: Backend was returning 403 (Forbidden) for expired tokens instead of 401 (Unauthorized)
3. **Frontend Only Handled 401**: The axios interceptor was only catching 401 errors, not 403

## Root Causes

### 1. Refresh Token Expiration Too Short
**File**: `backend/src/main/resources/application.properties`

**Before**:
```properties
app.jwt.refresh-expiration=604800
```
This was interpreted as 604,800 milliseconds = ~10 minutes

**After**:
```properties
app.jwt.refresh-expiration=604800000
```
Now correctly set to 604,800,000 milliseconds = 7 days

### 2. Backend Returning 403 Instead of 401
**File**: `backend/src/main/java/com/badminton/booking/security/JwtAuthenticationFilter.java`

**Issue**: When JWT validation failed, the filter would just not set authentication, causing Spring Security to return 403 (Forbidden) instead of 401 (Unauthorized).

**Fix**: Added explicit error handling to return 401 with a clear error message when token is invalid or expired:

```java
try {
    username = jwtService.extractUsername(token);
} catch (Exception e) {
    // Token không hợp lệ hoặc đã hết hạn - trả về 401
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    response.setContentType("application/json");
    response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
    return;
}
```

### 3. Frontend Interceptor Enhancement
**File**: `frontend/src/axiosConfig/axiosConfig.js`

**Changes**:
- Updated to handle both 401 AND 403 status codes
- Added comprehensive logging for debugging
- Added request queuing while token refresh is in progress

## Token Configuration Summary

| Token Type | Expiration | Value (ms) |
|------------|-----------|------------|
| Access Token | 1 hour | 3,600,000 |
| Refresh Token | 7 days | 604,800,000 |

## How Token Refresh Works

1. **Access Token Expires** (after 1 hour)
   - User makes a request with expired access token
   - Backend returns 401 (or 403 if not caught by filter)

2. **Frontend Interceptor Catches Error**
   - Detects 401/403 status code
   - Checks if refresh token exists
   - Calls `/api/auth/refresh` endpoint

3. **Backend Refreshes Tokens**
   - Validates refresh token (checks expiry, user active status)
   - Generates new access token
   - Rotates refresh token (creates new one for security)
   - Returns both tokens

4. **Frontend Updates Tokens**
   - Stores new access token and refresh token
   - Retries original failed request with new access token
   - Processes any queued requests

5. **If Refresh Fails**
   - Logs user out
   - Redirects to login page

## Testing

To test the fix:

1. **Start Backend**: `cd backend && mvn spring-boot:run`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Login**: Access http://localhost:3000 and login
4. **Wait 1+ hour** OR **Manually expire token** by changing `app.jwt.expiration` to a small value (e.g., 60000 = 1 minute)
5. **Navigate to authenticated page**: e.g., My Bookings
6. **Check Console**: Should see token refresh logs:
   ```
   🔴 Received 401 error for: /api/bookings/my-bookings
   🔄 Attempting to refresh token...
   ✅ Token refreshed successfully
   🔁 Retrying original request
   ```

## Files Modified

### Backend
1. `backend/src/main/resources/application.properties` - Fixed refresh token expiration (604800 → 604800000)
2. `backend/src/main/java/com/badminton/booking/security/JwtAuthenticationFilter.java` - Return 401 for expired tokens with explicit error handling

### Frontend
1. `frontend/src/axiosConfig/axiosConfig.js` - Handle both 401 and 403, added comprehensive logging
2. `frontend/src/pages/admin/BookingSchedule.jsx` - Removed PAYMENT_CONFIRMED status references (3 occurrences)

## Notes

- Logout and login always worked because it creates fresh tokens
- The issue only appeared after the access token expired (1 hour)
- Refresh token rotation improves security by creating a new refresh token on each refresh
- The fix maintains backward compatibility - no database changes needed
