package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.MonthlyOvertimeDTO;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeSummaryDTO;
import com.g98.sangchengpayrollmanager.model.entity.OvertimeBalance;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.OvertimeBalanceRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.service.OvertimeBalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OvertimeBalanceServiceImpl implements OvertimeBalanceService {

    private final UserRepository userRepository;
    private final OvertimeBalanceRepository overtimeBalanceRepository;

    @Override
    public Integer getMyYearlyOvertime(Integer year) {

        String username = getCurrentUserName();

        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại " + username));

        return getYearlyOvertimeByEmployeeCode(user.getEmployeeCode(), year);
    }

    @Override
    public Integer getEmployeeYearlyOvertime(String employeeCode, Integer year) {
        return getYearlyOvertimeByEmployeeCode(employeeCode, year);
    }

    @Override
    public OvertimeSummaryDTO getEmployeeOvertimeSummary(String employeeCode, Integer year) {
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        User username = userRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên " + employeeCode));
        Integer total =  overtimeBalanceRepository.sumYearlyBalance(employeeCode, year);
        if (total == null) {
            total = 0 ;
        }
        List<Object[]> rows = overtimeBalanceRepository.sumMonthlyBalance(employeeCode, year);
        List<MonthlyOvertimeDTO> monthlyOvertimeDTOS = new ArrayList<>();
        for (Object[] row : rows) {
            Integer month = (Integer) row[0];
            Integer overtime = ((Integer) row[1]).intValue();
            monthlyOvertimeDTOS.add(new MonthlyOvertimeDTO(month, overtime));
        }
        return new OvertimeSummaryDTO(
                username.getEmployeeCode(),
                username.getFullName(),
                year,
                total,
                monthlyOvertimeDTOS
        );

    }

    public Integer getYearlyOvertimeByEmployeeCode(String employeeCode, Integer year) {
        if (employeeCode == null || employeeCode.isEmpty()) {
            year = LocalDate.now().getYear();
        }

        return overtimeBalanceRepository.sumYearlyBalance(employeeCode, year);

    }

    private String getCurrentUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
