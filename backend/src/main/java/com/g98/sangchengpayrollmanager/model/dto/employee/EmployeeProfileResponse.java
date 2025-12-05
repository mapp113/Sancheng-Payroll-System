package com.g98.sangchengpayrollmanager.model.dto.employee;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeProfileResponse {
    private String employeeCode;
    private String fullName;
    private String position;
    private LocalDate joinDate;
    private String personalEmail;
    private String contractType;
    private String phone;
    private LocalDate dob;
    private String status;
    private String citizenId;
    private String address;
    private LocalDate visaExpiry;
    private String contractUrl;
    private String taxCode;
    private Integer dependentsNo; // ⭐ Đổi từ String sang Integer nếu cần
}
