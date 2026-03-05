package com.badminton.booking.service;

import java.math.BigDecimal;
import java.util.Map;

public interface VnPayService {

    /**
     * Generate VNPay payment URL for a booking deposit.
     *
     * @param bookingId booking identifier
     * @param amount deposit amount in VND
     * @param ipAddress client IP address
     * @return redirect URL to VNPay sandbox
     */
    String createPaymentUrl(Integer bookingId, BigDecimal amount, String ipAddress);

    /**
     * Validate VNPay return data signature.
     *
     * @param vnpParams map of vnp_* params
     * @return true if signature is valid
     */
    boolean validateSignature(Map<String, String> vnpParams);

    /**
     * Extract booking id from vnp_TxnRef.
     */
    Integer extractBookingId(String vnpTxnRef);
}

