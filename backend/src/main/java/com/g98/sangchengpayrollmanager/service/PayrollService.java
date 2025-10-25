package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.PaySummary;

import java.time.LocalDate;

public interface PayrollService {
    PaySummary calculateMonthlySalary(String employeeCode, LocalDate month);
}
