package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.payroll.response.EmployeePayrollRowDto;
import com.g98.sangchengpayrollmanager.service.EmployeePayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/employee/payroll")
@RequiredArgsConstructor
public class EmployeePayrollController {

    private final EmployeePayrollService employeePayrollService;

    @GetMapping
    public ResponseEntity<List<EmployeePayrollRowDto>> getMyPayroll(
            @RequestParam int year
    ) {
        List<EmployeePayrollRowDto> data = employeePayrollService.getMyPayrollByYear(year);
        return ResponseEntity.ok(data);
    }
}

