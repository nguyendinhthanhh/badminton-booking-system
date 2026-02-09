-- Populate booking_type for existing bookings where it's NULL
-- If created_by is set (admin-created), assume WALK_IN; else if user_id is set, assume ONLINE; fallback to WALK_IN

UPDATE bookings
SET booking_type = CASE
    WHEN created_by IS NOT NULL AND booking_type IS NULL THEN 'WALK_IN'
    WHEN user_id IS NOT NULL AND booking_type IS NULL THEN 'ONLINE'
    WHEN booking_type IS NULL THEN 'WALK_IN'
    ELSE booking_type
END
WHERE booking_type IS NULL;

-- Optional: ensure no NULLs remain
UPDATE bookings SET booking_type = 'WALK_IN' WHERE booking_type IS NULL;
