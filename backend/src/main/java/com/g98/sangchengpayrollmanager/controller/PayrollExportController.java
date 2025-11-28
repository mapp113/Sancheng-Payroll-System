package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.service.PayrollExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/payroll-export")
@RequiredArgsConstructor
public class PayrollExportController {

    private final PayrollExportService payrollExportService;

    /**
     * API xuất file Excel bảng lương theo tháng
     * @param monthDate: ngày bất kỳ trong tháng cần export (thường là ngày đầu tháng)
     */
    @GetMapping
    public ResponseEntity<Resource> exportPayrollExcel(
            @RequestParam("month")
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            LocalDate monthDate
    ) throws Exception {

        byte[] fileContent = payrollExportService.exportPayrollExcel(monthDate);

        String filename = String.format(
                "bang-luong-%d-%02d.xlsx",
                monthDate.getYear(),
                monthDate.getMonthValue()
        );

        ByteArrayResource resource = new ByteArrayResource(fileContent);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .contentLength(fileContent.length)
                .body(resource);
    }
}

