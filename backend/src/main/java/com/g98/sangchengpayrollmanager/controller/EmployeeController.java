package com.g98.sangchengpayrollmanager.controller;


import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeInfoResponse;
import com.g98.sangchengpayrollmanager.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/{employeeCode}")
    public EmployeeInfoResponse getEmployee(@PathVariable String employeeCode) {
        return employeeService.getByEmployeeCode(employeeCode);
    }
}

