-- Add max_duration_minutes column for walk-in open-ended bookings
-- This field stores the maximum time a walk-in customer can play (for soft-blocking future slots)

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS max_duration_minutes INTEGER;

-- Add comment
COMMENT ON COLUMN bookings.max_duration_minutes IS 'Maximum duration in minutes for open-ended walk-in bookings. Used for soft-blocking slots.';

