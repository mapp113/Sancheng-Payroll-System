package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.UserDTO;
import com.g98.sangchengpayrollmanager.model.dto.api.response.ApiResponse;
import com.g98.sangchengpayrollmanager.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
public class HrController {
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
}
