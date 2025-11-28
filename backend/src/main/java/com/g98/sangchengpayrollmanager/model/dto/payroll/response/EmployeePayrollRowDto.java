package com.g98.sangchengpayrollmanager.model.dto.payroll.response;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EmployeePayrollRowDto {
    private LocalDate month;      // luôn là ngày đầu tháng, FE format thành "11-2025"
    private double dayStandard;   // Công chuẩn
    private double daysPayable;   // Công thực tế
    private int netSalary;        // Lương thực nhận
    private boolean hasPayslip;   // true nếu đã có PDF
}
