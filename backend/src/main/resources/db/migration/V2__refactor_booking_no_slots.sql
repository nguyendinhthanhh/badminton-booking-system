-- =====================================================
-- REFACTOR: Bỏ slot-based, chuyển sang startTime-endTime
-- =====================================================

-- 1. Cập nhật bảng bookings: thêm startTime, endTime, bufferMinutes
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS actual_end_time TIME,
ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS overtime_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Cập nhật status enum cho bookings
-- Các status: PENDING, CONFIRMED, PLAYING, COMPLETED, CANCELLED, NO_SHOW

-- 3. Bảng cấu hình Buffer Time và Overtime
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default config
INSERT INTO system_config (config_key, config_value, description) VALUES
('BUFFER_MINUTES', '10', 'Thời gian buffer giữa 2 booking (phút)'),
('OVERTIME_RATE_MULTIPLIER', '1.5', 'Hệ số phí overtime (1.5x giá thường)'),
('MAX_OVERTIME_MINUTES', '30', 'Số phút overtime tối đa cho phép'),
('MIN_BOOKING_DURATION', '60', 'Thời lượng đặt sân tối thiểu (phút)'),
('MAX_BOOKING_DURATION', '240', 'Thời lượng đặt sân tối đa (phút)')
ON CONFLICT (config_key) DO NOTHING;

-- 4. Index để tối ưu query kiểm tra overlap
CREATE INDEX IF NOT EXISTS idx_bookings_court_date_time
ON bookings (court_id, play_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_bookings_status
ON bookings (status);

-- 5. Bảng lịch sử gia hạn booking
CREATE TABLE IF NOT EXISTS booking_extensions (
    extension_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    original_end_time TIME NOT NULL,
    extended_end_time TIME NOT NULL,
    extension_minutes INTEGER NOT NULL,
    extension_fee DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng chi tiết giá booking (breakdown từng khung giờ)
CREATE TABLE IF NOT EXISTS booking_price_breakdown (
    breakdown_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    price_period_start TIME NOT NULL,
    price_period_end TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    day_type VARCHAR(20) NOT NULL
);

