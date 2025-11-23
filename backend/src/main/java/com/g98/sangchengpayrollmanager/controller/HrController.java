package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.UserDTO;
import com.g98.sangchengpayrollmanager.model.dto.api.response.ApiResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileUpdateRequest;
import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.SalaryInformationResponse;
import com.g98.sangchengpayrollmanager.service.AdminService;
import com.g98.sangchengpayrollmanager.service.EmployeeService;
import com.g98.sangchengpayrollmanager.service.PayrollInfoService;
import com.g98.sangchengpayrollmanager.service.impl.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
public class HrController {
    private final AdminService adminService;
    private final EmployeeService employeeService;
    private final JwtService jwtService;
    private final PayrollInfoService payrollInfoService;


    @GetMapping("/users")
    public ApiResponse<List<UserDTO>> getUsers() {
        List<UserDTO> users = adminService.getAllEmployees();
        return ApiResponse.<List<UserDTO>>builder()
                .status(200)
                .message("Lấy danh sách user thành công")
                .data(users)
                .build();
    }

    @GetMapping("/users/{employeeCode}/profile")
    public EmployeeProfileResponse getEmployeeProfile(@PathVariable String employeeCode) {
        return employeeService.getProfile(employeeCode);
    }

    @PutMapping("/users/{employeeCode}/profile")
    public EmployeeProfileResponse updateEmployeeProfile(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String employeeCode,
            @RequestBody EmployeeProfileUpdateRequest request
    ) {
        String token = extractToken(authorization);
        String role = jwtService.extractRole(token);
        return employeeService.updateProfile(employeeCode, role, request);
    }

    @GetMapping("/users/{employeeCode}/salary-information")
    public ApiResponse<List<SalaryInformationResponse>> getSalaryInformation(@PathVariable String employeeCode) {
        List<SalaryInformationResponse> salaryInformation = payrollInfoService.getSalaryInformation(employeeCode);
        return ApiResponse.<List<SalaryInformationResponse>>builder()
                .status(200)
                .message("Lấy thông tin lương thành công")
                .data(salaryInformation)
                .build();
    }

    @GetMapping("/users/{employeeCode}/pay-components")
    public ApiResponse<List<PayComponentResponse>> getPayComponents(@PathVariable String employeeCode) {
        List<PayComponentResponse> payComponents = payrollInfoService.getPayComponents(employeeCode);
        return ApiResponse.<List<PayComponentResponse>>builder()
                .status(200)
                .message("Lấy danh sách pay component thành công")
                .data(payComponents)
                .build();
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Thiếu token xác thực");
        }
        return authorizationHeader.substring(7);
    }
}