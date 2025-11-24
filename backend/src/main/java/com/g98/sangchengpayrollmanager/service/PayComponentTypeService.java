package com.g98.sangchengpayrollmanager.service;


import com.g98.sangchengpayrollmanager.model.dto.PayComponentTypeDTO;
import com.g98.sangchengpayrollmanager.model.dto.paycomponenttype.PayComponentTypeRespone;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.LegalPolicy;
import com.g98.sangchengpayrollmanager.model.entity.PayComponentType;
import com.g98.sangchengpayrollmanager.repository.LegalPolicyRepository;
import com.g98.sangchengpayrollmanager.repository.PayComponentTypeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayComponentTypeService {

    private final PayComponentTypeRepository payComponentTypeRepository;
    private final LegalPolicyRepository legalPolicyRepository;

    public List<PayComponentTypeRespone> findAll() {
        return payComponentTypeRepository.findAll().stream()
                .map(this::toRespone).collect(Collectors.toList());
    }

    public PayComponentTypeRespone getById(Integer id) {

        PayComponentType payComponentType = payComponentTypeRepository.findById(id).orElse(null);
        return toRespone(payComponentType);

    }

    @Transactional
    public PayComponentTypeRespone create(PayComponentTypeDTO payComponentTypedto) {

        LegalPolicy policy = findPolicyByCodeNullable(payComponentTypedto.getPolicyCode());

        if (payComponentTypedto == null) {
            return null;
        }
        PayComponentType payComponentType = PayComponentType.builder()
                .name(payComponentTypedto.getName())
                .description(payComponentTypedto.getDescription())
                .isInsured(payComponentTypedto.getIsInsured())
                .isTaxed(payComponentTypedto.getIsTaxed())
                .taxTreatmentCode(payComponentTypedto.getTaxTreatmentCode())
                .policy(policy)
                .build();

        payComponentTypeRepository.save(payComponentType);
        return toRespone(payComponentType);
    }

    @Transactional
    public PayComponentTypeRespone update(Integer id, PayComponentTypeDTO dto) {

        PayComponentType payComponentType = payComponentTypeRepository.findById(id).orElse(null);
        if (dto == null) {
            return null;
        }
        LegalPolicy policy = findPolicyByCodeNullable(dto.getPolicyCode());
        payComponentType.setName(dto.getName());
        payComponentType.setDescription(dto.getDescription());
        payComponentType.setIsInsured(dto.getIsInsured());
        payComponentType.setIsTaxed(dto.getIsTaxed());
        payComponentType.setTaxTreatmentCode(dto.getTaxTreatmentCode());
        payComponentType.setPolicy(policy);

        payComponentTypeRepository.save(payComponentType);
        return toRespone(payComponentType);
    }

    @Transactional
    public void  delete(Integer id) {
        PayComponentType payComponentType = payComponentTypeRepository.findById(id).orElse(null);
        if (!payComponentTypeRepository.existsById(id)) {
            payComponentTypeRepository.delete(payComponentType);
        }
    }


    private LegalPolicy findPolicyByCodeNullable(String code) {
        if (code ==  null && code.isBlank())
            return null;
        return legalPolicyRepository.findByCode(code).orElseThrow(() -> new RuntimeException("Legal policy not found"));
    }
    private PayComponentTypeRespone toRespone(PayComponentType payComponentType) {
        return PayComponentTypeRespone.builder()
                .id(payComponentType.getId())
                .name(payComponentType.getName())
                .description(payComponentType.getDescription())
                .isInsured(payComponentType.getIsInsured())
                .isTaxed(payComponentType.getIsTaxed())
                .taxTreatmentCode(payComponentType.getTaxTreatmentCode())
                .policyCode(payComponentType != null ? payComponentType.getTaxTreatmentCode() : null)
                .build();
    }
}
