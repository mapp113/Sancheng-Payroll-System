package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.auth.PasswordResetRequests;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final String DIGITS = "0123456789";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, ResetEntry> tokens = new ConcurrentHashMap<>();

    @Value("${app.password-reset.code-length:6}")
    private int codeLength;

    @Value("${app.password-reset.expiry-minutes:10}")
    private long expiryMinutes;

    @Value("${app.password-reset.mail.from:noreply@sangcheng-payroll.com}")
    private String defaultFromAddress;

    @Value("${app.password-reset.mail.enabled:true}")
    private boolean mailEnabled;

    public void sendResetCode(PasswordResetRequests.Forgot request) {
        String email = normalize(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        String code = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(expiryMinutes);
        tokens.put(email, new ResetEntry(code, expiresAt));

        sendEmail(email, user.getFullName(), code);
    }

    public void verifyResetCode(PasswordResetRequests.Verify request) {
        ResetEntry entry = requireValidEntry(request.email(), request.code());
        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã xác thực đã hết hạn");
        }
    }

    public void resetPassword(PasswordResetRequests.Reset request) {
        String email = normalize(request.email());
        ResetEntry entry = requireValidEntry(email, request.code());

        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            tokens.remove(email);
            throw new IllegalArgumentException("Mã xác thực đã hết hạn");
        }

        String newPassword = request.newPassword().trim();
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokens.remove(email);
    }

    private ResetEntry requireValidEntry(String email, String code) {
        String normalizedEmail = normalize(email);
        ResetEntry entry = tokens.get(normalizedEmail);
        if (entry == null || !entry.code().equals(code.trim())) {
            throw new IllegalArgumentException("Mã xác thực không hợp lệ");
        }
        return entry;
    }

    private String normalize(String value) {
        return value.trim().toLowerCase();
    }

    private String generateCode() {
        StringBuilder builder = new StringBuilder(codeLength);
        for (int i = 0; i < codeLength; i++) {
            builder.append(DIGITS.charAt(secureRandom.nextInt(DIGITS.length())));
        }
        return builder.toString();
    }

    private void sendEmail(String recipient, String fullName, String code) {
        if (!mailEnabled) {
            log.info("[PASSWORD RESET] Email: {}, Code: {}", recipient, code);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject("Mã đặt lại mật khẩu");
        message.setText("Xin chào " + fullName + ",\n\nMã đặt lại mật khẩu của bạn là: " + code
                + "\nMã sẽ hết hạn sau " + expiryMinutes + " phút.");
        message.setFrom(defaultFromAddress);
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            log.error("Không thể gửi email đặt lại mật khẩu tới {}", recipient, exception);
            throw new IllegalStateException("Không thể gửi email xác thực. Vui lòng thử lại sau.");
        }
    }

    private record ResetEntry(String code, LocalDateTime expiresAt) {
    }
}