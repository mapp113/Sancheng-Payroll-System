package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.attendant.request.AttDailySummaryUpdateRequest;
import com.g98.sangchengpayrollmanager.model.dto.attendant.response.AttDailySummaryResponse;
import com.g98.sangchengpayrollmanager.model.dto.attendant.response.AttMonthSummaryResponse;
import com.g98.sangchengpayrollmanager.model.dto.attendant.response.TimeSheetResponse;
import com.g98.sangchengpayrollmanager.service.AttDailySummaryService;
import com.g98.sangchengpayrollmanager.service.AttMonthSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attsummary")
@RequiredArgsConstructor
public class AttSummaryController {
    private final AttMonthSummaryService service;
    private final AttDailySummaryService attDailySummaryService;

    @GetMapping
    public Page<TimeSheetResponse> getTimeSheetByMonth(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                       @RequestParam(required = false) String keyword,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "5") int size,
                                                       @RequestParam(required = false) String sortBy,
                                                       @RequestParam(required = false) String sortDir) {
        return service.getTimeSheetByMonth(date, keyword, sortBy, sortDir, page, size);
    }

    @GetMapping("/month")
    public ResponseEntity<AttMonthSummaryResponse> getAttMonthByEmployeeAndMonth(@RequestParam("month") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month,
                                                                                 @RequestParam String employeeCode){
        return ResponseEntity.ok(service.getAttMonthByEmployeeAndMonth(month, employeeCode));
    }

    @GetMapping("/by-month")
    public ResponseEntity<List<AttDailySummaryResponse>> getByEmployeeAndMonth(
            @RequestParam String employeeCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {

        return ResponseEntity.ok(attDailySummaryService.getByEmployeeAndMonth(employeeCode, month));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Void> updateDailySummary(
            @PathVariable Integer id,
            @RequestBody AttDailySummaryUpdateRequest request
    ) {
        attDailySummaryService.updateDailySummary(id, request);
        return ResponseEntity.noContent().build(); // 204
    }
}


