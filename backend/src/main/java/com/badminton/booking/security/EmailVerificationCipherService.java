package com.badminton.booking.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

@Service
public class EmailVerificationCipherService {
    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final SecureRandom secureRandom = new SecureRandom();
    private final byte[] secretKey;

    public EmailVerificationCipherService(@Value("${app.email-verification.encryption-key}") String base64Key) {
        this.secretKey = Base64.getDecoder().decode(base64Key);
        if (this.secretKey.length != 16 && this.secretKey.length != 24 && this.secretKey.length != 32) {
            throw new IllegalArgumentException("app.email-verification.encryption-key must be a valid Base64 AES key (16/24/32 bytes).");
        }
    }

    public String encryptToken(String rawToken) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(AES_GCM);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey, "AES");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

            byte[] encrypted = cipher.doFinal(rawToken.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

            return Base64.getUrlEncoder().withoutPadding().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt email verification token.", e);
        }
    }

    public Optional<String> tryDecryptToken(String encryptedToken) {
        try {
            byte[] combined = Base64.getUrlDecoder().decode(encryptedToken);
            if (combined.length <= IV_LENGTH) {
                return Optional.empty();
            }

            byte[] iv = new byte[IV_LENGTH];
            byte[] encrypted = new byte[combined.length - IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH);
            System.arraycopy(combined, IV_LENGTH, encrypted, 0, encrypted.length);

            Cipher cipher = Cipher.getInstance(AES_GCM);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey, "AES");
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);

            byte[] decrypted = cipher.doFinal(encrypted);
            return Optional.of(new String(decrypted, StandardCharsets.UTF_8));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
