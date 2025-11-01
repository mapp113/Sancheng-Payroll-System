package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeInfoResponse;
import com.g98.sangchengpayrollmanager.model.entity.EmployeeInformation;
import com.g98.sangchengpayrollmanager.repository.EmployeeInformationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeInformationRepository repo;

    public EmployeeInfoResponse getByEmployeeCode(String employeeCode) {
        EmployeeInformation info = repo.findByEmployeeCodeFetchAll(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có mã: " + employeeCode));
        return EmployeeInfoResponse.fromEntity(info);
    }
}

