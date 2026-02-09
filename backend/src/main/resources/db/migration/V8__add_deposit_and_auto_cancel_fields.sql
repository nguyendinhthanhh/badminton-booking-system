-- Add deposit and auto-cancel fields to bookings table
ALTER TABLE bookings 
ADD COLUMN deposit_amount DECIMAL(10,2),
ADD COLUMN deposit_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN remaining_amount DECIMAL(10,2),
ADD COLUMN deposit_required BOOLEAN DEFAULT true,
ADD COLUMN check_in_deadline TIMESTAMP;

-- Add index for scheduled job performance
CREATE INDEX idx_bookings_check_in_deadline 
ON bookings(status, check_in_deadline) 
WHERE check_in_deadline IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.deposit_amount IS 'Số tiền cọc cần thanh toán trước (1/3 tổng tiền)';
COMMENT ON COLUMN bookings.deposit_paid IS 'Số tiền cọc đã thanh toán';
COMMENT ON COLUMN bookings.remaining_amount IS 'Số tiền còn lại cần thanh toán khi check-in';
COMMENT ON COLUMN bookings.check_in_deadline IS 'Thời điểm deadline check-in (startTime + 20 phút)';
