package com.g98.sangchengpayrollmanager.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.LOCKED)
public class AccountLockedException extends RuntimeException {

    public AccountLockedException() {
        super("Tài khoản đang tạm khóa. Vui lòng liên hệ quản trị viên để kích hoạt lại.");
    }
}