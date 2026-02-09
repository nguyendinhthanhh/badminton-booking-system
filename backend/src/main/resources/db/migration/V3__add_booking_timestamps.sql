-- =====================================================
-- Thêm các trường timestamp cho booking
-- =====================================================

-- Thời điểm tạo booking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

-- Thời điểm admin xác nhận
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;

-- Thời điểm check-in
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP;

-- Thời điểm hoàn thành
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Thời điểm hủy
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Ai hủy (USER hoặc ADMIN)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20);

-- Cập nhật created_at cho các booking cũ dựa trên booking_date
UPDATE bookings
SET created_at = booking_date::timestamp + TIME '08:00:00'
WHERE created_at IS NULL AND booking_date IS NOT NULL;

-- Index để tối ưu query
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);

