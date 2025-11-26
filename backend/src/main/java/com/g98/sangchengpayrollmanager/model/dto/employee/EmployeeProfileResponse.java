package com.g98.sangchengpayrollmanager.model.dto.employee;

import java.time.LocalDate;

public record EmployeeProfileResponse(
        String employeeCode,
        String fullName,
        String position,
        LocalDate joinDate,
        String personalEmail,
        String contractType,
        String phone,
        LocalDate dob,
        String status,
        String citizenId,
        String address,
        LocalDate visaExpiry,
        String contractUrl,
        String taxCode,
        Integer dependentsNo
) {
}
