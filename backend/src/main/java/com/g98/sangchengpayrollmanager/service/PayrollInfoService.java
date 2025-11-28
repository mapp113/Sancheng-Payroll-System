package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentCreateRequest;
import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.PayComponentTypeResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.SalaryInformationCreateRequest;
import com.g98.sangchengpayrollmanager.model.dto.payroll.SalaryInformationResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.request.PayComponentEndDateUpdateRequest;
import com.g98.sangchengpayrollmanager.model.entity.PayComponent;
import com.g98.sangchengpayrollmanager.model.entity.PayComponentType;
import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.PayComponentRepository;
import com.g98.sangchengpayrollmanager.repository.PayComponentTypeRepository;
import com.g98.sangchengpayrollmanager.repository.SalaryInformationRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollInfoService {

    private final SalaryInformationRepository salaryInformationRepository;
    private final PayComponentRepository payComponentRepository;
    private final PayComponentTypeRepository payComponentTypeRepository;
    private final UserRepository userRepository;

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

    public List<PayComponentTypeResponse> getPayComponentTypes() {
        return payComponentTypeRepository.findAll()
                .stream()
                .map(type -> new PayComponentTypeResponse(
                        type.getId(),
                        type.getName(),
                        type.getDescription()
                ))
                .toList();
    }

    public SalaryInformationResponse addSalaryInformation(String employeeCode, SalaryInformationCreateRequest request) {
        User user = userRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với mã: " + employeeCode));

        if (request.getBaseSalary() == null || request.getBaseHourlyRate() == null || request.getEffectiveFrom() == null) {
            throw new RuntimeException("Thiếu thông tin bắt buộc về lương cơ bản");
        }

        SalaryInformation salaryInformation = SalaryInformation.builder()
                .user(user)
                .baseSalary(request.getBaseSalary())
                .baseHourlyRate(request.getBaseHourlyRate())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .status(request.getStatus())
                .date(LocalDate.now())
                .build();

        SalaryInformation saved = salaryInformationRepository.save(salaryInformation);
        return mapSalaryInfo(saved);
    }

    public PayComponentResponse addPayComponent(String employeeCode, PayComponentCreateRequest request) {
        User user = userRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với mã: " + employeeCode));

        if (request.getTypeId() == null
                || request.getName() == null
                || request.getDescription() == null
                || request.getValue() == null
                || request.getStartDate() == null) {
            throw new RuntimeException("Thiếu thông tin bắt buộc về phụ cấp");
        }

        PayComponentType type = payComponentTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại phụ cấp với ID: " + request.getTypeId()));

        boolean isAddition = !Integer.valueOf(8).equals(request.getTypeId());


        PayComponent payComponent = PayComponent.builder()
                .user(user)
                .type(type)
                .name(request.getName())
                .description(request.getDescription())
                .value(request.getValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .occurrences(request.getOccurrences() != null ? request.getOccurrences() : 1)
                .percent(request.getPercent())
                .isAddition(isAddition)
                .build();

        PayComponent saved = payComponentRepository.save(payComponent);
        return mapPayComponent(saved);
    }

    public PayComponentResponse updatePayComponentEndDate(
            String employeeCode,
            Integer payComponentId,
            PayComponentEndDateUpdateRequest request
    ) {
        PayComponent payComponent = payComponentRepository.findById(payComponentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ cấp với ID: " + payComponentId));

        if (!payComponent.getUser().getEmployeeCode().equals(employeeCode)) {
            throw new RuntimeException("Phụ cấp không thuộc về nhân viên có mã: " + employeeCode);
        }

        payComponent.setEndDate(request.getEndDate());

        PayComponent updated = payComponentRepository.save(payComponent);
        return mapPayComponent(updated);
    }

    public SalaryInformationResponse updateSalaryInformation(String employeeCode, Integer salaryId, SalaryInformationCreateRequest request) {
        SalaryInformation salaryInformation = salaryInformationRepository.findById(salaryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin lương với ID: " + salaryId));

        if (!salaryInformation.getUser().getEmployeeCode().equals(employeeCode)) {
            throw new RuntimeException("Thông tin lương không thuộc về nhân viên có mã: " + employeeCode);
        }

        if (request.getBaseSalary() == null || request.getBaseHourlyRate() == null || request.getEffectiveFrom() == null) {
            throw new RuntimeException("Thiếu thông tin bắt buộc về lương cơ bản");
        }

        salaryInformation.setBaseSalary(request.getBaseSalary());
        salaryInformation.setBaseHourlyRate(request.getBaseHourlyRate());
        salaryInformation.setEffectiveFrom(request.getEffectiveFrom());
        salaryInformation.setEffectiveTo(request.getEffectiveTo());
        salaryInformation.setStatus(request.getStatus());
        salaryInformation.setDate(LocalDate.now());

        SalaryInformation updated = salaryInformationRepository.save(salaryInformation);
        return mapSalaryInfo(updated);
    }

    private SalaryInformationResponse mapSalaryInfo(SalaryInformation salaryInformation) {
        return new SalaryInformationResponse(
                salaryInformation.getId(),
                salaryInformation.getBaseSalary(),
                salaryInformation.getBaseHourlyRate(),
                salaryInformation.getEffectiveFrom(),
                salaryInformation.getEffectiveTo(),
                salaryInformation.getStatus()
        );
    }

    private PayComponentResponse mapPayComponent(PayComponent payComponent) {
        return new PayComponentResponse(
                payComponent.getId(),
                payComponent.getType() != null ? payComponent.getType().getId() : null,
                payComponent.getType() != null ? payComponent.getType().getName() : null,
                payComponent.getName(),
                payComponent.getValue(),
                payComponent.getStartDate(),
                payComponent.getEndDate()
        );
    }
}