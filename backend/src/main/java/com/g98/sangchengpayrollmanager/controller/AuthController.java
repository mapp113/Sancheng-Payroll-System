package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.api.response.ApiResponse;
import com.g98.sangchengpayrollmanager.model.dto.auth.ChangePasswordRequest;
import com.g98.sangchengpayrollmanager.model.dto.auth.LoginRequest;
import com.g98.sangchengpayrollmanager.model.dto.auth.LoginResponse;
import com.g98.sangchengpayrollmanager.model.dto.auth.PasswordResetRequests;
import com.g98.sangchengpayrollmanager.security.AccountLockedException;
import com.g98.sangchengpayrollmanager.security.InvalidCredentialsException;
import com.g98.sangchengpayrollmanager.service.AuthService;
import com.g98.sangchengpayrollmanager.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
@Validated
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsername());

        try {
            LoginResponse response = authService.authenticate(loginRequest);
            log.info("Login successful for user: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
        } catch (AccountLockedException exception) {
            log.warn("Login denied for user {}: {}", loginRequest.getUsername(), exception.getMessage());
            return ResponseEntity.status(HttpStatus.LOCKED).body(ApiResponse.builder()
                    .status(HttpStatus.LOCKED.value())
                    .message(exception.getMessage())
                    .build());
        } catch (InvalidCredentialsException exception) {
            log.warn("Login failed for user {}: {}", loginRequest.getUsername(), exception.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .message(exception.getMessage())
                    .build());
        } catch (Exception exception) {
            log.error("Login failed for user: {}", loginRequest.getUsername(), exception);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .message("Đăng nhập không thành công")
                    .build());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody @Valid PasswordResetRequests.Forgot request) {
        try {
            passwordResetService.sendResetCode(request);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .message("Mã xác thực đã được gửi tới email của bạn")
                    .build());
        } catch (IllegalArgumentException | IllegalStateException exception) {
            log.warn("Forgot password failed for email {}: {}", request.email(), exception.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(exception.getMessage())
                    .build());
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<ApiResponse<Void>> verifyResetCode(@RequestBody @Valid PasswordResetRequests.Verify request) {
        try {
            passwordResetService.verifyResetCode(request);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .message("Mã xác thực hợp lệ")
                    .build());
        } catch (IllegalArgumentException exception) {
            log.warn("Verify reset code failed for email {}: {}", request.email(), exception.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(exception.getMessage())
                    .build());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody @Valid PasswordResetRequests.Reset request) {
        try {
            passwordResetService.resetPassword(request);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .message("Đặt lại mật khẩu thành công")
                    .build());
        } catch (IllegalArgumentException | IllegalStateException exception) {
            log.warn("Reset password failed for email {}: {}", request.email(), exception.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(exception.getMessage())
                    .build());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody @Valid ChangePasswordRequest request,
                                                            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.<Void>builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .message("Bạn cần đăng nhập để đổi mật khẩu")
                    .build());
        }

        try {
            authService.changePassword(authentication.getName(), request);
            return ResponseEntity.ok(ApiResponse.<Void>builder()
                    .message("Đổi mật khẩu thành công")
                    .build());
        } catch (IllegalArgumentException exception) {
            log.warn("Change password failed for user {}: {}", authentication.getName(), exception.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<Void>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(exception.getMessage())
                    .build());
        }
    }
}
