package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.TaxLevelDTO;
import com.g98.sangchengpayrollmanager.model.dto.taxlevel.TaxLevelResponse;
import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import com.g98.sangchengpayrollmanager.model.entity.TaxLevel;
import com.g98.sangchengpayrollmanager.repository.TaxLevelRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaxLevelService {
    private final TaxLevelRepository taxLevelRepository;

    public List<TaxLevelResponse> getAllTaxLevels() {
        return getAllSorted().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TaxLevelResponse addTaxLevel(TaxLevelDTO request) {

        Integer fromValue = request.getFromValue();
        Integer toValue = request.getToValue();

        if (fromValue == null || toValue == null) {
            throw new RuntimeException("Khoảng thu nhập không được null");
        }
        if (fromValue > toValue) {
            throw new RuntimeException("Giá trị 'from' phải nhỏ hơn hoặc bằng 'to'");
        }

        // Validate effectiveTo
        if (request.getEffectiveTo() != null &&
                request.getEffectiveTo().isBefore(request.getEffectiveFrom())) {
            throw new RuntimeException("effectiveTo phải >= effectiveFrom");
        }


        List<TaxLevel> allTaxLevelList = taxLevelRepository.findAll();
        System.out.println("xon chao quang dan");
        for(TaxLevel taxLevel : allTaxLevelList) {
            LocalDate from = taxLevel.getEffectiveFrom();
            LocalDate to   = taxLevel.getEffectiveTo(); // có thể null

            if(to != null) {
                boolean dateOverlap =
                        !request.getEffectiveFrom().isBefore(from) &&       // newFrom >= from
                                request.getEffectiveFrom().isBefore(to); // và newFrom < to
                if (dateOverlap) {
                    throw new RuntimeException("effectiveFrom bị trùng với khoảng thời gian khác");
                }
            }

        }
        System.out.println("xon chao quang dan222222");
        List<TaxLevel> existingLevels = taxLevelRepository.findByEffectiveFrom(request.getEffectiveFrom());

        // Policy đang áp dụng tại thời điểm hiện tại
        List<TaxLevel> activeLevels = taxLevelRepository.findActiveLevels(LocalDate.now());
        LocalDate currentPolicyFrom = activeLevels.isEmpty()
                ? request.getEffectiveFrom()
                : activeLevels.get(0).getEffectiveFrom();

        boolean isNewPolicy = activeLevels.isEmpty()
                || request.getEffectiveFrom().isAfter(currentPolicyFrom);

        if(existingLevels.isEmpty()) {
            if (isNewPolicy) {
                taxLevelRepository.closeCurrentPolicy(request.getEffectiveFrom().minusDays(1));
            }
        }

        for (TaxLevel t : existingLevels) {
            boolean overlap = fromValue < t.getToValue();
            if (overlap) {
                throw new RuntimeException(
                        "Khoảng thu nhập " + fromValue + " - " + toValue
                                + " bị trùng với bậc thuế " + t.getFromValue() + " - " + t.getToValue()
                );
            }
        }
        TaxLevel taxLevel = TaxLevel.builder()
                .name(request.getName())
                .fromValue(request.getFromValue())
                .toValue(request.getToValue())
                .percentage(request.getPercentage())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .build();

        taxLevel = taxLevelRepository.save(taxLevel);
        return toResponse(taxLevel);
    }

    @Transactional
    public TaxLevelResponse updateTaxLevel(Integer id, TaxLevelDTO request) {
        TaxLevel taxLevel = taxLevelRepository.findById(id).orElse(null);

        taxLevel.setName(request.getName());
        taxLevel.setFromValue(request.getFromValue());
        taxLevel.setToValue(request.getToValue());
        taxLevel.setPercentage(request.getPercentage());
        taxLevel.setEffectiveFrom(request.getEffectiveFrom());
        taxLevel.setEffectiveTo(request.getEffectiveTo());
        return toResponse(taxLevelRepository.save(taxLevel));

    }

    public void deleteTaxLevel(Integer id) {
        if(!taxLevelRepository.existsById(id)) {
            throw new RuntimeException("Khong ton tai:  " + id);
        }
        taxLevelRepository.deleteById(id);
    }

    public List<TaxLevel> getAllSorted() {
        List<TaxLevel> list = taxLevelRepository.findAll();
        list.sort(Comparator.comparing(TaxLevel:: isActive).reversed());
        return list;

    }

    private TaxLevelResponse toResponse(TaxLevel t) {
        return TaxLevelResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .fromValue(t.getFromValue())
                .toValue(t.getToValue())
                .percentage(t.getPercentage())
                .effectiveFrom(t.getEffectiveFrom())
                .effectiveTo(t.getEffectiveTo())
                .active(t.isActive())
                .build();
    }

}
