-- Script để update các booking hiện có với thông tin deposit
-- Chạy script này sau khi migration V8 đã chạy

-- Update tất cả booking ONLINE chưa có deposit info
UPDATE bookings 
SET 
    deposit_amount = ROUND(total_price / 3, 0),
    deposit_paid = CASE 
        WHEN status IN ('PAYMENT_CONFIRMED', 'CONFIRMED', 'PLAYING', 'COMPLETED') 
        THEN ROUND(total_price / 3, 0)
        ELSE 0 
    END,
    remaining_amount = CASE 
        WHEN status IN ('PAYMENT_CONFIRMED', 'CONFIRMED', 'PLAYING', 'COMPLETED') 
        THEN total_price - ROUND(total_price / 3, 0)
        ELSE total_price 
    END,
    deposit_required = true,
    check_in_deadline = CASE 
        WHEN play_date IS NOT NULL AND start_time IS NOT NULL 
        THEN (play_date || ' ' || start_time)::timestamp + INTERVAL '20 minutes'
        ELSE NULL 
    END
WHERE 
    booking_type = 'ONLINE' 
    AND deposit_amount IS NULL;

-- Update status cho các booking đã thanh toán
UPDATE bookings 
SET status = 'PAYMENT_CONFIRMED'
WHERE 
    status = 'CONFIRMED' 
    AND booking_type = 'ONLINE'
    AND deposit_paid > 0
    AND deposit_paid >= deposit_amount;

-- Hiển thị kết quả
SELECT 
    booking_id,
    status,
    total_price,
    deposit_amount,
    deposit_paid,
    remaining_amount,
    check_in_deadline
FROM bookings 
WHERE booking_type = 'ONLINE'
ORDER BY booking_id DESC
LIMIT 10;
