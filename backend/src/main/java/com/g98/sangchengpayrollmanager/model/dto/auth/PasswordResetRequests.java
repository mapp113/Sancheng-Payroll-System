package com.g98.sangchengpayrollmanager.model.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class PasswordResetRequests {
    private PasswordResetRequests() {
    }

    public record Forgot(@Email(message = "Email không hợp lệ") @NotBlank(message = "Email không được để trống")
                         String email) {
    }

    public record Verify(
            @Email(message = "Email không hợp lệ") @NotBlank(message = "Email không được để trống") String email,
            @NotBlank(message = "Mã xác thực không được để trống") String code) {
    }

    public record Reset(
            @Email(message = "Email không hợp lệ") @NotBlank(message = "Email không được để trống") String email,
            @NotBlank(message = "Mã xác thực không được để trống") String code,
            @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự") String newPassword) {
    }
}