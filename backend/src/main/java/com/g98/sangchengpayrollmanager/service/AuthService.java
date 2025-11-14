package com.g98.sangchengpayrollmanager.service;

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
                .orElseThrow(InvalidCredentialsException::new);

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
}


