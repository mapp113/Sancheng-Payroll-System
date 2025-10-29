package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.auth.LoginRequest;
import com.g98.sangchengpayrollmanager.model.dto.auth.LoginResponse;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.security.InvalidCredentialsException;
import com.g98.sangchengpayrollmanager.service.impl.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public LoginResponse authenticate(LoginRequest request) {
        try {
            User user = userRepository.findByUsernameWithRole(request.getUsername())
                    .orElseThrow(InvalidCredentialsException::new);

            if (!user.getPassword().equals(request.getPassword())) {
                throw new InvalidCredentialsException();
            }

            String token = jwtService.generateToken(user.getUsername(), user.getFullName(), user.getRole());

            return LoginResponse.builder()
                    .token(token)
                    .message("Login successful")
                    .build();

        } catch (InvalidCredentialsException e) {
            return LoginResponse.builder()
                    .token(null)
                    .message("Login failed: invalid username or password")
                    .build();

        } catch (Exception e) {
            // Tránh crash khi lỗi khác (ví dụ DB)
            return LoginResponse.builder()
                    .token(null)
                    .message("Login failed: internal error")
                    .build();
        }
    }
}

