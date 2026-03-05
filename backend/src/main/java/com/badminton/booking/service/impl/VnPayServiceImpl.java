package com.badminton.booking.service.impl;

import com.badminton.booking.service.VnPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayServiceImpl implements VnPayService {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.version}")
    private String version;

    @Value("${vnpay.command}")
    private String command;

    @Value("${vnpay.curr-code}")
    private String currCode;

    @Value("${vnpay.locale}")
    private String locale;

    @Value("${vnpay.order-type:other}")
    private String orderType;

    @Override
    public String createPaymentUrl(Integer bookingId, BigDecimal amount, String ipAddress) {
        try {
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

            String txnRef = bookingId + "_" + System.currentTimeMillis();
            String orderInfo = "Thanh toan tien coc booking #" + bookingId;

            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", version);
            vnpParams.put("vnp_Command", command);
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amountInCents));
            vnpParams.put("vnp_CurrCode", currCode);
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", orderType);
            vnpParams.put("vnp_Locale", locale);
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_IpAddr", ipAddress != null ? ipAddress : "127.0.0.1");

            String createDate = getCurrentDateTime();
            vnpParams.put("vnp_CreateDate", createDate);

            String queryString = buildQueryString(vnpParams);
            String secureHash = hmacSHA512(hashSecret, queryString);

            return payUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
        } catch (Exception ex) {
            log.error("Error when creating VNPay payment URL", ex);
            throw new RuntimeException("Không thể tạo URL thanh toán VNPay", ex);
        }
    }

    @Override
    public boolean validateSignature(Map<String, String> vnpParams) {
        if (vnpParams == null || vnpParams.isEmpty()) {
            return false;
        }

        String receivedHash = vnpParams.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            return false;
        }

        Map<String, String> paramsForHash = new HashMap<>(vnpParams);
        paramsForHash.remove("vnp_SecureHash");
        paramsForHash.remove("vnp_SecureHashType");

        String queryString = buildQueryString(paramsForHash);
        String calculatedHash = hmacSHA512(hashSecret, queryString);

        return receivedHash.equalsIgnoreCase(calculatedHash);
    }

    @Override
    public Integer extractBookingId(String vnpTxnRef) {
        if (vnpTxnRef == null || vnpTxnRef.isBlank()) {
            return null;
        }
        try {
            String[] parts = vnpTxnRef.split("_");
            return Integer.valueOf(parts[0]);
        } catch (Exception ex) {
            log.warn("Cannot extract booking id from vnp_TxnRef: {}", vnpTxnRef);
            return null;
        }
    }

    private String getCurrentDateTime() {
        java.time.ZonedDateTime now = java.time.ZonedDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        return now.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    private String buildQueryString(Map<String, String> params) {
        SortedMap<String, String> sorted = new TreeMap<>(params);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                if (!sb.isEmpty()) {
                    sb.append("&");
                }
                sb.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII));
                sb.append("=");
                sb.append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            javax.crypto.Mac hmac = javax.crypto.Mac.getInstance("HmacSHA512");
            javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(2 * hashBytes.length);
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Error generating HMAC SHA512", ex);
        }
    }
}

