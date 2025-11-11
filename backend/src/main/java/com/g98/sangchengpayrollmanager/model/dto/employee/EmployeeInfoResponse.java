package com.g98.sangchengpayrollmanager.model.dto.employee;

import com.g98.sangchengpayrollmanager.model.entity.EmployeeInformation;
import com.g98.sangchengpayrollmanager.model.entity.Position;
import com.g98.sangchengpayrollmanager.model.entity.User;

import java.time.LocalDate;

public record EmployeeInfoResponse(
        // --- Thông tin từ bảng User ---
        String employeeCode,
        String fullName,
        String username,
        String email,
        LocalDate dob,
        String phoneNo,

        // --- Thông tin từ bảng EmployeeInformation ---
        String taxNo,
        String socialNo,
        String bankNumber,
        Integer dependentsNo,

        // --- Thông tin từ bảng Position ---
        Integer positionId,
        String positionName
) {

    public static EmployeeInfoResponse fromEntity(EmployeeInformation info) {
        User u = info.getUser();
        Position p = info.getPosition();

        return new EmployeeInfoResponse(
                // user
                u.getEmployeeCode(),
                u.getFullName(),
                u.getUsername(),
                u.getEmail(),
                u.getDob(),
                u.getPhoneNo(),

                // employee_information
                info.getTaxNo(),
                info.getSocialNo(),
                info.getBankNumber(),
                info.getDependentsNo(),

                // position
                p != null ? p.getId() : null,
                p != null ? p.getName() : null
        );
    }
}

