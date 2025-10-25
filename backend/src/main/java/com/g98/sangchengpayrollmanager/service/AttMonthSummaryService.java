package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.attendant.response.TimeSheetResponse;
import com.g98.sangchengpayrollmanager.repository.AttMonthSummaryRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AttMonthSummaryService {
    private final AttMonthSummaryRepository attMonthRepo;

    public Page<TimeSheetResponse> getTimeSheetByMonth(LocalDate date, String keyword, String sortBy, String sortDir, int page, int size){
        String searchValue = (keyword == null || keyword.isBlank()) ? "" : keyword.trim();
//        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
//        String sortField = (sortBy == null || sortBy.isBlank()) ? "employeeCode" : sortBy;
        Pageable pageable = PageRequest.of(page, size);
        return attMonthRepo.findTimeSheetByMonth(date, searchValue, pageable);
    }
}
