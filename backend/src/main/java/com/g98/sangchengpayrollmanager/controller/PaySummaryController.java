package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.payroll.request.MonthlySalaryRequest;
import com.g98.sangchengpayrollmanager.model.dto.payroll.response.BatchSalaryResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.response.PaySummaryDto;
import com.g98.sangchengpayrollmanager.model.dto.payroll.response.PaySummaryResponse;
import com.g98.sangchengpayrollmanager.service.PaySummaryService;
import com.g98.sangchengpayrollmanager.service.PayslipPdfService;
import com.g98.sangchengpayrollmanager.service.impl.PayrollServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;

import java.io.IOException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/paysummaries")
@RequiredArgsConstructor
public class PaySummaryController {

    private final PaySummaryService service;
    private final PayrollServiceImpl payrollService;
    private final PayslipPdfService payslipPdfService;

    @GetMapping
    public Page<PaySummaryResponse> getByDate(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                              @RequestParam(required = false) String keyword,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "5") int size,
                                              @RequestParam(defaultValue = "id") String sortBy,
                                              @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return service.getPaySummariesByDate(date, keyword, sortBy, sortDir, page, size);
    }

    @GetMapping("/detail")
    public PaySummaryDto getDetail(
            @RequestParam String employeeCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month
    ) {
        // gọi đúng hàm bạn đã viết trong service
        return service.getEmployeePayroll(employeeCode, month);
    }

    @PostMapping("/calculate-monthly")
    public ResponseEntity<BatchSalaryResponse> calculateMonthlySalary(
            @RequestBody MonthlySalaryRequest request) {

        LocalDate month = request.getMonth();
        YearMonth ym = YearMonth.from(month);

        LocalDate monthStart = ym.atDay(1);
        LocalDate monthEnd = ym.atEndOfMonth();

        List<String> errors = new ArrayList<>();
        List<String> pdfErrors = new ArrayList<>();
        int successCount = 0;

        for (String code : request.getEmployeeCodes()) {
            boolean salaryOk = false;
            try {
                payrollService.calculateMonthlySalary(code, month, monthStart, monthEnd);
                salaryOk = true;
                successCount++;
            } catch (Exception e) {
                errors.add(code + ": " + e.getMessage());
            }

            // 2) TẠO PAYSLIP (chỉ làm khi tính lương thành công)
            // -------------------
            if (salaryOk) {
                try {
                    payslipPdfService.generatePayslipAndUpdateSummary(code, month);
                } catch (Exception e) {
                    pdfErrors.add(code + " (payslip): " + e.getMessage());
                }
            }
        }

        HttpStatus status;
        String message;

        if (errors.isEmpty()) {
            status = HttpStatus.OK;
            message = "Tạo thành công bảng lương cho " + successCount + " nhân viên.";
        } else {
            if (successCount > 0) status = HttpStatus.MULTI_STATUS;
            else status = HttpStatus.BAD_REQUEST;
            message = "Có " + errors.size() + " nhân viên tạo lương thất bại. Vui lòng kiểm tra.";
        }

        // gộp pdfErrors vào kết quả trả về cho HR biết
        List<String> allErrors = new ArrayList<>(errors);
        allErrors.addAll(pdfErrors);

        BatchSalaryResponse response = new BatchSalaryResponse(message, allErrors);

        return ResponseEntity.status(status).body(response);
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> download(
            @RequestParam String employeeCode,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate month) throws IOException {
        return payslipPdfService.downloadPayslip(employeeCode, month);
    }


}
