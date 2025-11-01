package com.g98.sangchengpayrollmanager.model.dto.payroll.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PaySummaryDto(
        String employeeCode,
        LocalDate month,
        int grossIncome,
        int assessableIncome,
        int taxableIncome,
        int taxAmount,
        int bhAmount,
        int netSalary,
        int otHour,
        int otAmount,
        int baseSalaryAmt,
        List<PaySummaryComponentDto> components
) {}

