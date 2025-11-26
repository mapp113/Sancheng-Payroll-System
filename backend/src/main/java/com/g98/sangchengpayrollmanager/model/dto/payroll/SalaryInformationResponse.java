package com.g98.sangchengpayrollmanager.model.dto.payroll;

import java.time.LocalDate;

public record SalaryInformationResponse(
        Integer id,
        Integer baseSalary,
        Integer baseHourlyRate,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        String status
) {
}