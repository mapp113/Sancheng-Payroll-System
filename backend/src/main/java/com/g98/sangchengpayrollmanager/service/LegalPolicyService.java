package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.legalpolicy.LegalPolicyRespone;
import com.g98.sangchengpayrollmanager.model.entity.LegalPolicy;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.repository.LegalPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LegalPolicyService {
    private final LegalPolicyRepository legalPolicyRepository;

    public List<LegalPolicyRespone> getAllLegalPolicies() {
        return legalPolicyRepository.findAll().stream()
                .map(this::toRespone)
                .collect(Collectors.toList());
    }

    private LegalPolicyRespone toRespone(LegalPolicy legalPolicy) {
        return LegalPolicyRespone.builder()
                .id(legalPolicy.getId())
                .code(legalPolicy.getCode())
                .description(legalPolicy.getDescription())
                .calculationType(legalPolicy.getCalculationType())
                .applyScope(legalPolicy.getApplyScope())
                .amount(legalPolicy.getAmount())
                .percent(legalPolicy.getPercent())
                .effectiveFrom(legalPolicy.getEffectiveFrom())
                .effectiveTo(legalPolicy.getEffectiveTo())
                .build();
    }

}
