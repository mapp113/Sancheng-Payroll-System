package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.MonthlyOvertimeDTO;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeSummaryDTO;
import com.g98.sangchengpayrollmanager.service.OvertimeBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overtime-balance")
@RequiredArgsConstructor
public class OvertimeBalanceController {

    private final OvertimeBalanceService overtimeBalanceService;

    @GetMapping("/summary")
    public OvertimeSummaryDTO getEmployeeOTSummary(@PathVariable String employeeCode,
                                                   @RequestParam(required = false) Integer year) {
        return overtimeBalanceService.getEmployeeOvertimeSummary(employeeCode, year);
    }
}
