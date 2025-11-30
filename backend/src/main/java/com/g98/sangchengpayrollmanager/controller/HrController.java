package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.UserDTO;
import com.g98.sangchengpayrollmanager.model.dto.api.response.ApiResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileUpdateRequest;
import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentCreateRequest;
import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentTypeResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.SalaryInformationCreateRequest;
import com.g98.sangchengpayrollmanager.model.dto.payroll.SalaryInformationResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.request.PayComponentEndDateUpdateRequest;
import com.g98.sangchengpayrollmanager.service.AdminService;
import com.g98.sangchengpayrollmanager.service.EmployeeService;
import com.g98.sangchengpayrollmanager.service.PayrollInfoService;
import com.g98.sangchengpayrollmanager.service.impl.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PutMapping("/users/{employeeCode}")
    public EmployeeProfileResponse updateProfile(
            @PathVariable String employeeCode,
            @RequestHeader("Authorization") String authorization,
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

    @GetMapping("/pay-component-types")
    public ApiResponse<List<PayComponentTypeResponse>> getPayComponentTypes() {
        List<PayComponentTypeResponse> types = payrollInfoService.getPayComponentTypes();
        return ApiResponse.<List<PayComponentTypeResponse>>builder()
                .status(200)
                .message("Lấy danh sách loại phụ cấp thành công")
                .data(types)
                .build();
    }

    @PostMapping("/users/{employeeCode}/salary-information")
    public ApiResponse<SalaryInformationResponse> addSalaryInformation(
            @PathVariable String employeeCode,
            @RequestBody SalaryInformationCreateRequest request
    ) {
        SalaryInformationResponse salaryInformation = payrollInfoService.addSalaryInformation(employeeCode, request);
        return ApiResponse.<SalaryInformationResponse>builder()
                .status(200)
                .message("Thêm thông tin lương thành công")
                .data(salaryInformation)
                .build();
    }

    @PostMapping("/users/{employeeCode}/contract/upload")
    public ApiResponse<String> uploadContract(
            @PathVariable String employeeCode,
            @RequestParam("file") MultipartFile file
    ) {
        String path = employeeService.uploadContractPdf(employeeCode, file);
        return ApiResponse.<String>builder()
                .status(200)
                .message("Tải lên hợp đồng thành công")
                .data(path)
                .build();
    }


    @PostMapping("/users/{employeeCode}/pay-components")
    public ApiResponse<PayComponentResponse> addPayComponent(
            @PathVariable String employeeCode,
            @RequestBody PayComponentCreateRequest request
    ) {
        PayComponentResponse payComponent = payrollInfoService.addPayComponent(employeeCode, request);
        return ApiResponse.<PayComponentResponse>builder()
                .status(200)
                .message("Thêm phụ cấp thành công")
                .data(payComponent)
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

    @PutMapping("/users/{employeeCode}/salary-information/{salaryId}")
    public ApiResponse<SalaryInformationResponse> updateSalaryInformation(
            @PathVariable String employeeCode,
            @PathVariable Integer salaryId,
            @RequestBody SalaryInformationCreateRequest request
    ) {
        SalaryInformationResponse salaryInformation = payrollInfoService.updateSalaryInformation(employeeCode, salaryId, request);
        return ApiResponse.<SalaryInformationResponse>builder()
                .status(200)
                .message("Cập nhật thông tin lương thành công")
                .data(salaryInformation)
                .build();
    }

    @PutMapping("/users/{employeeCode}/pay-components/{payComponentId}")
    public ApiResponse<PayComponentResponse> updatePayComponentEndDate(
            @PathVariable String employeeCode,
            @PathVariable Integer payComponentId,
            @RequestBody PayComponentEndDateUpdateRequest request
    ) {
        PayComponentResponse updatedPayComponent = payrollInfoService.updatePayComponentEndDate(
                employeeCode,
                payComponentId,
                request
        );
        return ApiResponse.<PayComponentResponse>builder()
                .status(200)
                .message("Cập nhật ngày kết thúc phụ cấp thành công")
                .data(updatedPayComponent)
                .build();
    }


    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Thiếu token xác thực");
        }
        return authorizationHeader.substring(7);
    }
}
