package com.g98.sangchengpayrollmanager.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class ConfirmExceptionHandler {

    @ExceptionHandler(ConfirmException.class)
    public ResponseEntity<?> handleConfirmException(ConfirmException ex) {
        Map<String,Object> body = new HashMap<>();
        body.put("type", "CONFIRM");
        body.put("code", ex.getCode());
        body.put("message", ex.getMessage());
        body.put("payload", ex.getPayload());

        return ResponseEntity.ok(body.toString());
    }
}
