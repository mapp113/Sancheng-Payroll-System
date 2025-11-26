package com.g98.sangchengpayrollmanager.model.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaryInformationCreateRequest {
    private Integer baseSalary;
    private Integer baseHourlyRate;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private String status;
}