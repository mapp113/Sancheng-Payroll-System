package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.LeaveQuotaDTO;
import com.g98.sangchengpayrollmanager.model.dto.LeaveQuotaYearSummaryResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveQuota;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.LeaveQuotaRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.service.LeaveQuotaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveQuotaServiceImpl implements LeaveQuotaService {

    private final LeaveQuotaRepository leaveQuotaRepository;
    private final  LeaveTypeRepository leaveTypeRepository;
    private final UserRepository userRepository;



    @Override
    public LeaveQuotaYearSummaryResponse getQuotaByEmployeeAndYear(String employeeCode, Integer year) {
        User user = userRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại " + employeeCode));

        List<LeaveQuota> quotas = leaveQuotaRepository.findByEmployeeCodeAndYear(employeeCode, year);

        LeaveQuotaYearSummaryResponse response = new LeaveQuotaYearSummaryResponse();
        response.setEmployeeCode(user.getEmployeeCode());
        response.setEmployeeName(user.getFullName());
        response.setYear(year);

        List<LeaveQuotaDTO> rows = quotas.stream()
                .map(quota -> {
                    LeaveQuotaDTO dto = new LeaveQuotaDTO();
                    dto.setLeaveTypeCode(quota.getLeaveTypeCode());
                    dto.setLeaveTypeName(quota.getLeaveType().getName());
                    dto.setEntitledDays(quota.getEntitledDays());
                    dto.setCarriedOver(quota.getCarriedOver());
                    dto.setUsedDays(quota.getUsedDays());
                    dto.setRemainingDays(quota.getRemainingDays());
                    return dto;
                })
                .collect(Collectors.toList());

        response.setQuotas(rows);
        return response;
    }


    //TẠO QUOTA CHO 1 NHÂN VIÊN TRONG NĂM


    private void createQuotaForEmployeeAndYear(User user, int year) {
        String employeeCode = user.getEmployeeCode();

        boolean hasQuota = leaveQuotaRepository.existsByEmployeeCodeAndYear(employeeCode, year);
        if (hasQuota) {
            // đã có quota năm đó rồi thì bỏ qua
            return;
        }

        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();

        for (LeaveType leaveType : leaveTypes) {
            Double entitleDays = leaveType.getStandardDaysPerYear() != null
                    ? leaveType.getStandardDaysPerYear().doubleValue()
                    : 0.0;

            LeaveQuota quota = LeaveQuota.builder()
                    .employeeCode(employeeCode)
                    .leaveTypeCode(leaveType.getCode())
                    .year(year)
                    .entitledDays(entitleDays)
                    .carriedOver(0.0)
                    .usedDays(0.0)
                    .build();

            leaveQuotaRepository.save(quota);
        }
    }

    // Tạo quota cho nhân viên mới trong NĂM HIỆN TẠI.
    @Override
    @Transactional
    public void initQuotaForNewEmployee(String employeeCode, Integer year) {
        User user = userRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại " + employeeCode));

        createQuotaForEmployeeAndYear(user, year);
    }

    // Tạo quota cho TẤT CẢ nhân viên trong NĂM
    @Override
    @Transactional
    public void initLeaveQuotaForYear(int year) {
        List<User> employees = userRepository.findAll();
        for (User user : employees) {
            createQuotaForEmployeeAndYear(user, year);
        }
    }
}
