package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.MonthlyOvertimeDTO;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeSummaryDTO;
import com.g98.sangchengpayrollmanager.service.OvertimeBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/overtime-balance")
@RequiredArgsConstructor
public class OvertimeBalanceController {

    private final OvertimeBalanceService overtimeBalanceService;

    @GetMapping("/summary")
    public OvertimeSummaryDTO getEmployeeOTSummary(
            @RequestParam String employeeCode,
            @RequestParam(required = false) Integer year
    )
    {
        Integer total = overtimeBalanceService.getEmployeeYearlyOvertime(employeeCode, year);
        List<MonthlyOvertimeDTO> monthly =
                overtimeBalanceService.getEmployeeMonthlyOvertime(employeeCode, year);

        return new OvertimeSummaryDTO(total, monthly);
    }
}
