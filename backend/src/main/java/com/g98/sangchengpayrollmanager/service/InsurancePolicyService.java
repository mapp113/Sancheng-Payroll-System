package com.g98.sangchengpayrollmanager.service;


import com.g98.sangchengpayrollmanager.model.dto.InsurancePolicyDTO;
import com.g98.sangchengpayrollmanager.model.dto.insurancepolicy.InsurancePolicyResponse;
import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import com.g98.sangchengpayrollmanager.repository.InsurancePolicyRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsurancePolicyService {
    private final InsurancePolicyRepository insurancePolicyRepository;

    public List<InsurancePolicyResponse> getAllInsurancePolicies() {
        return getAllSorted().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InsurancePolicyResponse updateInsurancePolicy(Integer id, InsurancePolicyDTO updateInsurancePolicyDTO) {
        InsurancePolicy insurancePolicy = insurancePolicyRepository.findById(id).orElse(null);

        insurancePolicy.setName(updateInsurancePolicyDTO.getInsurancePolicyName());
        insurancePolicy.setEmployeePercentage(updateInsurancePolicyDTO.getEmployeePercentage());
        insurancePolicy.setCompanyPercentage(updateInsurancePolicyDTO.getCompanyPercentage());
        insurancePolicy.setMaxAmount(updateInsurancePolicyDTO.getMaxAmount());

        insurancePolicy.setEffectiveFrom(updateInsurancePolicyDTO.getEffectiveFrom());
        insurancePolicy.setEffectiveTo(updateInsurancePolicyDTO.getEffectiveTo());

        insurancePolicy = insurancePolicyRepository.save(insurancePolicy);
        return toResponse(insurancePolicy);
    }

    @Transactional
    public InsurancePolicyResponse addInsurancePolicy( InsurancePolicyDTO addInsurancePolicyDTO) {

        InsurancePolicy insurancePolicy = InsurancePolicy.builder()
                .name(addInsurancePolicyDTO.getInsurancePolicyName())
                .employeePercentage(addInsurancePolicyDTO.getEmployeePercentage())
                .companyPercentage(addInsurancePolicyDTO.getCompanyPercentage())
                .maxAmount(addInsurancePolicyDTO.getMaxAmount())
                .effectiveFrom(addInsurancePolicyDTO.getEffectiveFrom())
                .effectiveTo(addInsurancePolicyDTO.getEffectiveTo())
                .build();

        insurancePolicy = insurancePolicyRepository.save(insurancePolicy);
        return toResponse(insurancePolicy);

    }

    public List<InsurancePolicy> getAllSorted() {
        List<InsurancePolicy> list = insurancePolicyRepository.findAll();
        list.sort(Comparator.comparing(InsurancePolicy:: isActive).reversed());
        return list;
    }


    public void  deleteInsurancePolicy(Integer id) {

        if (!insurancePolicyRepository.existsById(id)) {
            throw new RuntimeException("Khong ton tai:  " + id);
        }
        insurancePolicyRepository.deleteById(id);


    }

    private InsurancePolicyResponse toResponse(InsurancePolicy insurancePolicy) {
        return InsurancePolicyResponse.builder()
                .insurancePolicyId(insurancePolicy.getId())
                .insurancePolicyName(insurancePolicy.getName())
                .employeePercentage(insurancePolicy.getEmployeePercentage())
                .companyPercentage(insurancePolicy.getCompanyPercentage())
                .maxAmount(insurancePolicy.getMaxAmount())
                .effectiveFrom(insurancePolicy.getEffectiveFrom())
                .effectiveTo(insurancePolicy.getEffectiveTo())
                .active(insurancePolicy.isActive())
                .build();
    }
}
