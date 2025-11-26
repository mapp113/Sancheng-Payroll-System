package com.g98.sangchengpayrollmanager.model.dto.payroll;

import java.time.LocalDate;

public record SalaryInformationResponse(
        Integer baseSalary,
        LocalDate effectiveFrom,
        LocalDate effectiveTo
) {
}