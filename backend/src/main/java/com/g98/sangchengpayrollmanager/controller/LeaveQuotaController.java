package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.LeaveQuotaYearSummaryResponse;
import com.g98.sangchengpayrollmanager.service.LeaveQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/config/")
@RequiredArgsConstructor
public class LeaveQuotaController {

    private final LeaveQuotaService leaveQuotaService;

    @GetMapping("/summary")
    public LeaveQuotaYearSummaryResponse getLeaveQuotaSummary(@RequestParam String employeeCode,
                                                              @RequestParam Integer year) {
        return leaveQuotaService.getQuotaByEmployeeAndYear(employeeCode, year);
    }
}
