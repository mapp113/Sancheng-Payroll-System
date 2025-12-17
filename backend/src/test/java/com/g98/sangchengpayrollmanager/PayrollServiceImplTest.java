package com.g98.sangchengpayrollmanager;

import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import com.g98.sangchengpayrollmanager.repository.SalaryInformationRepository;
import com.g98.sangchengpayrollmanager.service.AttDailySummaryService;
import com.g98.sangchengpayrollmanager.service.AttMonthSummaryService;
import com.g98.sangchengpayrollmanager.service.impl.PayrollServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

@SpringBootTest
class PayrollServiceImplTest {


    //    private PayrollServiceImpl payrollService;
    @Autowired
    private AttDailySummaryService attDailySummaryService;
    @Autowired
    private AttMonthSummaryService attMonthSummaryService;

    @Test
    void testCalculateMonthlySalary() {
//        attMonthSummaryService.createMonthSummary("EMP007", LocalDate.of(2023, 8, 31));
//        attMonthSummaryService.createMonthSummary("EMP006", LocalDate.of(2023, 8, 31));
//        attMonthSummaryService.createMonthSummary("EMP005", LocalDate.of(2023, 8, 31));
//        attMonthSummaryService.createMonthSummary("EMP004", LocalDate.of(2023, 8, 31));
//        payrollService.calculateMonthlySalary(
//                "EMP010",
//                LocalDate.of(2023, 8, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2023, 8, 1), //monthStart
//                LocalDate.of(2023, 8, 31)  //monthEnd
//        );
//        attMonthSummaryService.createMonthSummary("EMP010", LocalDate.of(2023, 8, 31));
        attDailySummaryService.createDailySummary("EMP002", LocalDate.of(2025, 12, 21));

//        attMonthSummaryService.createMonthSummary("EMP001", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP002", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP003", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP004", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP005", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP006", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP007", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP008", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP009", LocalDate.of(2025, 10, 31));
//        attMonthSummaryService.createMonthSummary("EMP010", LocalDate.of(2025, 10, 31));
//
//        attMonthSummaryService.createMonthSummary("EMP001", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP002", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP003", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP004", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP005", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP006", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP007", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP008", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP009", LocalDate.of(2025, 11, 30));
//        attMonthSummaryService.createMonthSummary("EMP010", LocalDate.of(2025, 11, 30));
//
//        attMonthSummaryService.createMonthSummary("EMP001", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP002", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP003", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP004", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP005", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP006", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP007", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP008", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP009", LocalDate.of(2025, 12, 31));
//        attMonthSummaryService.createMonthSummary("EMP010", LocalDate.of(2025, 12, 31));
    }
}

