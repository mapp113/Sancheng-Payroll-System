package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.auth.ChangePasswordRequest;
import com.g98.sangchengpayrollmanager.model.dto.auth.LoginRequest;
import com.g98.sangchengpayrollmanager.model.dto.auth.LoginResponse;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.security.InvalidCredentialsException;
import com.g98.sangchengpayrollmanager.service.impl.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse authenticate(LoginRequest request) {
        // lấy user + role
        User user = userRepository.findByUsernameWithRole(request.getUsername())
                .orElseThrow(() -> new IllegalStateException("Tài khoản đang tạm khóa. Vui lòng liên hệ quản trị viên để kích hoạt lại."));

        // kiểm tra trạng thái tài khoản (1 = hoạt động, 0 = tạm khóa)
        if (!Integer.valueOf(1).equals(user.getStatus())) {
            throw new IllegalStateException("Tài khoản đang tạm khóa.");
        }
        // so sánh mật khẩu đã mã hóa
        boolean matched = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!matched) {
            throw new InvalidCredentialsException();
        }

        // tạo token
        String token = jwtService.generateToken(
                user.getUsername(),
                user.getFullName(),
                user.getRole(),
                user.getEmployeeCode()
        );

        return LoginResponse.builder()
                .token(token)
                .message("Login successful")
                .build();
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new IllegalArgumentException("User không tồn tại"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không chính xác");
        }

        String newPassword = request.newPassword().trim();
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}


