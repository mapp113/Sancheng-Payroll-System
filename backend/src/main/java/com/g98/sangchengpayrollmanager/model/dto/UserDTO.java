package com.g98.sangchengpayrollmanager.model.dto;


import java.time.LocalDate;

public record UserDTO(
        String userId,
        String employeeCode,
        String fullName,
        String username,
        String email,
        LocalDate dob,
        String phoneNo,
        Integer status,
        Integer roleId,
        String roleName
) {
}

