package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.attendant.response.TimeSheetResponse;
import com.g98.sangchengpayrollmanager.service.AttMonthSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/attsummary")
@RequiredArgsConstructor
public class AttSummaryController {
    private final AttMonthSummaryService service;

    @GetMapping
    public Page<TimeSheetResponse> getTimeSheetByMonth(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                       @RequestParam(required = false) String keyword,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "5") int size,
                                                       @RequestParam(required = false) String sortBy,
                                                       @RequestParam(required = false) String sortDir)
    {
        return service.getTimeSheetByMonth(date, keyword, sortBy, sortDir, page, size);
    }
}
