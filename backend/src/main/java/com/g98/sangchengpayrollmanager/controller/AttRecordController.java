package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.attendant.response.FirstCheckInResponse;
import com.g98.sangchengpayrollmanager.service.AttRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/att-records")
@RequiredArgsConstructor
public class AttRecordController {

    private final AttRecordService attRecordService;

    @GetMapping("/first-check-in")
    public ResponseEntity<FirstCheckInResponse> getFirstCheckInTime(
            @RequestParam String employeeCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(attRecordService.getFirstCheckInTime(employeeCode, date));
    }
}