package com.g98.sangchengpayrollmanager.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {


    //1. ConfirmException (FE phải hiển thị popup xác nhận)

    @ExceptionHandler(ConfirmException.class)
    public ResponseEntity<?> handleConfirm(ConfirmException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("type", "CONFIRM");
        body.put("code", ex.getCode());
        body.put("message", ex.getMessage());
        body.put("payload", ex.getPayload());  // monthlyAfter, yearlyAfter,...

        return ResponseEntity.ok(body); // FE vẫn nhận status 200
    }

    // 2. IllegalArgumentException (lỗi validate)

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("type", "ERROR");
        body.put("code", "BAD_REQUEST");
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 3. RuntimeException (lỗi hệ thống)

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("type", "ERROR");
        body.put("code", "SERVER_ERROR");
        body.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
