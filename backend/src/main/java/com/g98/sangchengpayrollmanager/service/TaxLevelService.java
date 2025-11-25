package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.TaxLevelDTO;
import com.g98.sangchengpayrollmanager.model.dto.taxlevel.TaxLevelResponse;
import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import com.g98.sangchengpayrollmanager.model.entity.TaxLevel;
import com.g98.sangchengpayrollmanager.repository.TaxLevelRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        if (fromValue > fromValue) {
            throw new RuntimeException("Giá trị 'from' phải nhỏ hơn hoặc bằng 'to'");
        }

        List<TaxLevel> existingLevels = taxLevelRepository.findAll();
        for (TaxLevel t : existingLevels) {
            boolean overlap = fromValue <= t.getToValue() && toValue >= t.getFromValue();
            if (overlap) {
                throw new RuntimeException(
                        "Khoảng thu nhập bị trùng với bậc thuế đang tồn tại: "
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
