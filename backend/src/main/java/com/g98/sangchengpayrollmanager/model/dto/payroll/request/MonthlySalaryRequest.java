package com.g98.sangchengpayrollmanager.model.dto.payroll.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class MonthlySalaryRequest {
    private List<String> employeeCodes;  // Danh sách mã nhân viên
    private LocalDate month;             // Chỉ cần 1 ngày bất kỳ trong tháng
}
