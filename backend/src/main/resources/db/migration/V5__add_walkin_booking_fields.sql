-- Add columns for walk-in booking support
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS open_ended BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by VARCHAR(50);

-- Add comments
COMMENT ON COLUMN bookings.booking_type IS 'ONLINE = đặt online, WALK_IN = khách vãng lai';
COMMENT ON COLUMN bookings.open_ended IS 'true = booking chưa xác định giờ kết thúc (khách chơi đến khi nào thì thôi)';
COMMENT ON COLUMN bookings.guest_name IS 'Tên khách vãng lai (khi không có user_id)';
COMMENT ON COLUMN bookings.guest_phone IS 'SĐT khách vãng lai';
COMMENT ON COLUMN bookings.created_by IS 'Username của admin tạo booking (cho walk-in)';

-- Update existing bookings to have booking_type = 'ONLINE'
UPDATE bookings SET booking_type = 'ONLINE' WHERE booking_type IS NULL;
UPDATE bookings SET open_ended = FALSE WHERE open_ended IS NULL;
