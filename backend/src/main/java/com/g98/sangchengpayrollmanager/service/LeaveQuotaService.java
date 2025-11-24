package com.g98.sangchengpayrollmanager.service;


import com.g98.sangchengpayrollmanager.model.dto.LeaveQuotaYearSummaryResponse;

public interface LeaveQuotaService {

    LeaveQuotaYearSummaryResponse getQuotaByEmployeeAndYear(String employeeCode, Integer year);

    void initQuotaForNewEmployee(String employeeCode, Integer year);

    void initLeaveQuotaForYear(int year);
}
