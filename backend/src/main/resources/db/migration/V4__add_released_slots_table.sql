-- V4: Tạo bảng released_slots để lưu các slot được release sớm từ booking
-- Khi khách check-out sớm, thời gian còn dư sẽ được tạo thành slot mới để người khác đặt

CREATE SEQUENCE IF NOT EXISTS released_slots_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE released_slots (
    id INTEGER NOT NULL DEFAULT nextval('released_slots_id_seq') PRIMARY KEY,
    court_id INTEGER NOT NULL REFERENCES badminton_courts(court_id),
    source_booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
    play_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'EARLY_RELEASE',  -- EARLY_RELEASE, CANCELLED, etc.
    status VARCHAR(50) DEFAULT 'AVAILABLE',    -- AVAILABLE, BOOKED, EXPIRED
    new_booking_id INTEGER REFERENCES bookings(booking_id),  -- Booking mới nếu slot này được đặt lại
    released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_by VARCHAR(100),  -- Username của admin thực hiện
    notes TEXT
);

-- Indexes
CREATE INDEX idx_released_slots_court_date ON released_slots(court_id, play_date);
CREATE INDEX idx_released_slots_source_booking ON released_slots(source_booking_id);
CREATE INDEX idx_released_slots_status ON released_slots(status);
CREATE INDEX idx_released_slots_play_date ON released_slots(play_date);

-- Comments
COMMENT ON TABLE released_slots IS 'Lưu các slot được release sớm từ booking khi khách về sớm';
COMMENT ON COLUMN released_slots.type IS 'Loại release: EARLY_RELEASE (khách về sớm), CANCELLED (booking bị hủy)';
COMMENT ON COLUMN released_slots.status IS 'Trạng thái slot: AVAILABLE (có thể đặt), BOOKED (đã được đặt lại), EXPIRED (đã hết hạn)';
COMMENT ON COLUMN released_slots.new_booking_id IS 'ID booking mới nếu slot này được người khác đặt';

