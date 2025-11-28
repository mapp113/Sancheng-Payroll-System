package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.repository.PaySummaryRepository;
import com.g98.sangchengpayrollmanager.util.PayrollRecord;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollExportService {
    private final PaySummaryRepository paySummaryRepo;

    public List<PayrollRecord> buildPayrollRecords(LocalDate monthDate) {
        List<PayrollRecord> records = paySummaryRepo.findPayrollRecordsByMonth(monthDate);
        String string = "SANCHENG THANH TOAN LUONG NHAN VIEN THANG " + monthDate.getMonthValue() + "-" + monthDate.getYear();

        records.forEach(r -> r.setDescription(string));
        return records;
    }

    public byte[] exportPayrollExcel(LocalDate monthDate) throws Exception {
        List<PayrollRecord> records = buildPayrollRecords(monthDate);

        // Đọc template trong resource
        ClassPathResource template = new ClassPathResource("excel-templates/bank-salary-template.xlsx");

        try (InputStream is = template.getInputStream();
             Workbook workbook = WorkbookFactory.create(is);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
                Sheet sheet = workbook.getSheetAt(0);
                int rowIndex = 2; // bắt đầu từ hàng 3 (index = 2)
                int stt = 1;

                for (PayrollRecord r : records) {
                    Row row = sheet.getRow(rowIndex);
                    if (row == null) row = sheet.createRow(rowIndex);

                    // A: STT
                    Cell cellA = row.getCell(0);
                    if (cellA == null) cellA = row.createCell(0);
                    cellA.setCellValue(stt++);

                    // B: Tên KH
                    Cell cellB = row.getCell(1);
                    if (cellB == null) cellB = row.createCell(1);
                    cellB.setCellValue(r.getCustomerName() != null ? r.getCustomerName() : "");

                    // C: Mô tả
                    Cell cellC = row.getCell(2);
                    if (cellC == null) cellC = row.createCell(2);
                    cellC.setCellValue(r.getDescription() != null ? r.getDescription() : "");

                    // D: Số tiền
                    Cell cellD = row.getCell(3);
                    if (cellD == null) cellD = row.createCell(3);
                    if (r.getAmount() != null) {
                        cellD.setCellValue(r.getAmount()); // numeric
                    } else {
                        cellD.setBlank();
                    }

                    // E: TK thụ hưởng
                    Cell cellE = row.getCell(4);
                    if (cellE == null) cellE = row.createCell(4);
                    cellE.setCellValue(r.getBankAccount() != null ? r.getBankAccount() : "");

                    rowIndex++;
                }

                // bắt Excel tính lại các ô có formula (E1, G1…)
                workbook.setForceFormulaRecalculation(true);

                workbook.write(bos);
                return bos.toByteArray();
             }
    }


}
