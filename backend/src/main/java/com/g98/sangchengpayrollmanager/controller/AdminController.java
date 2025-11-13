package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.CreateAccountRequest;
import com.g98.sangchengpayrollmanager.model.dto.RoleSummaryDTO;
import com.g98.sangchengpayrollmanager.model.dto.UpdateUserRequest;
import com.g98.sangchengpayrollmanager.model.dto.UserDTO;
import com.g98.sangchengpayrollmanager.model.dto.api.response.ApiResponse;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.AdminRepository;
import com.g98.sangchengpayrollmanager.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;


    @GetMapping("/users")
    public ApiResponse<List<UserDTO>> getUsers() {
        List<UserDTO> users = adminService.getAllUsers();
        return ApiResponse.<List<UserDTO>>builder()
                .status(200)
                .message("Lấy danh sách user thành công")
                .data(users)
                .build();
    }

    @GetMapping("/role-summary")
    public ApiResponse<List<RoleSummaryDTO>> getRoleSummary() {
        List<RoleSummaryDTO> summary = adminService.getRoleSummary();
        return ApiResponse.<List<RoleSummaryDTO>>builder()
                .status(200)
                .message("Lấy thống kê role thành công")
                .data(summary)
                .build();
    }

    @PostMapping(value = "/create-account",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)

    public ApiResponse<?> createAccount(@RequestBody CreateAccountRequest request) {
        return adminService.createAccount(request);
    }

    @PutMapping("/users/{employeeCode}")
    public ApiResponse<?> updateUser(
            @PathVariable String employeeCode,
            @RequestBody UpdateUserRequest request
    ) {
        // phòng trường hợp FE không set employeeCode trong body
        request.setEmployeeCode(employeeCode);
        return adminService.updateUser(employeeCode, request);
    }


}


