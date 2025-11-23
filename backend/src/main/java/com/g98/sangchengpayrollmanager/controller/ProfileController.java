package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileUpdateRequest;
import com.g98.sangchengpayrollmanager.service.EmployeeService;
import com.g98.sangchengpayrollmanager.service.impl.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final EmployeeService employeeService;
    private final JwtService jwtService;

    @GetMapping
    public EmployeeProfileResponse getProfile(@RequestHeader(HttpHeaders.AUTHORIZATION) String authorization) {
        String token = extractToken(authorization);
        String employeeCode = jwtService.extractEmployeeCode(token);
        return employeeService.getProfile(employeeCode);
    }

    @PutMapping
    public EmployeeProfileResponse updateProfile(
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorization,
            @RequestBody EmployeeProfileUpdateRequest request
    ) {
        String token = extractToken(authorization);
        String employeeCode = jwtService.extractEmployeeCode(token);
        String role = jwtService.extractRole(token);
        return employeeService.updateProfile(employeeCode, role, request);
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Thiếu token xác thực");
        }
        return authorizationHeader.substring(7);
    }
}