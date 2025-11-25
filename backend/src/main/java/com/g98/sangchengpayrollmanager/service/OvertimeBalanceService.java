package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.MonthlyOvertimeDTO;

import java.util.List;

public interface OvertimeBalanceService {

    Integer getMyYearlyOvertime(Integer year);

    Integer getEmployeeYearlyOvertime(String employeeCode, Integer year);

    List<MonthlyOvertimeDTO> getEmployeeMonthlyOvertime(String employeeCode, Integer year);
}
