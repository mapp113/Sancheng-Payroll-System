package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.payroll.response.PaySummaryResponse;
import com.g98.sangchengpayrollmanager.repository.PaySummaryRepository;
import com.g98.sangchengpayrollmanager.util.PaySummarySorts;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaySummaryService {
    private final PaySummaryRepository repo;

    public Page<PaySummaryResponse> getPaySummariesByDate(LocalDate date, String keyword,String sortBy, String sortDir, int page, int size) {
        String sortField = PaySummarySorts.MAP.getOrDefault(sortBy, "si.user.employeeCode");
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String searchValue = (keyword == null || keyword.isBlank()) ? "" : keyword.trim();
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));


        return repo.findSummariesByDate(date, searchValue,pageable);
    }
}
