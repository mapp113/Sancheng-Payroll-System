package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.SalaryInformationResponse;
import com.g98.sangchengpayrollmanager.model.entity.PayComponent;
import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import com.g98.sangchengpayrollmanager.repository.PayComponentRepository;
import com.g98.sangchengpayrollmanager.repository.SalaryInformationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollInfoService {

    private final SalaryInformationRepository salaryInformationRepository;
    private final PayComponentRepository payComponentRepository;

    public List<SalaryInformationResponse> getSalaryInformation(String employeeCode) {
        return salaryInformationRepository
                .findByUserEmployeeCodeOrderByEffectiveFromDesc(employeeCode)
                .stream()
                .map(this::mapSalaryInfo)
                .toList();
    }

    public List<PayComponentResponse> getPayComponents(String employeeCode) {
        return payComponentRepository
                .findByUserEmployeeCodeOrderByStartDateDesc(employeeCode)
                .stream()
                .map(this::mapPayComponent)
                .toList();
    }

    private SalaryInformationResponse mapSalaryInfo(SalaryInformation salaryInformation) {
        return new SalaryInformationResponse(
                salaryInformation.getBaseSalary(),
                salaryInformation.getEffectiveFrom(),
                salaryInformation.getEffectiveTo()
        );
    }

    private PayComponentResponse mapPayComponent(PayComponent payComponent) {
        return new PayComponentResponse(
                payComponent.getType() != null ? payComponent.getType().getId() : null,
                payComponent.getType() != null ? payComponent.getType().getName() : null,
                payComponent.getName(),
                payComponent.getValue(),
                payComponent.getStartDate(),
                payComponent.getEndDate()
        );
    }
}