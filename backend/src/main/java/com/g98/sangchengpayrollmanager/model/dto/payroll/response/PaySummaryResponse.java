package com.g98.sangchengpayrollmanager.model.dto.payroll.response;

public record PaySummaryResponse(
    String employeeCode,
    String fullName,
    String positionName,
    Integer netSalary,
    String status,
    String payslipUrl
) {
}
