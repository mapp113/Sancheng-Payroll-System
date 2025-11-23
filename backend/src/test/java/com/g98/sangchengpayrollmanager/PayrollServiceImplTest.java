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

    @Autowired
    private PayrollServiceImpl payrollService;
    //private AttMonthSummaryService attMonthSummaryService;


    //private AttDailySummaryService attDailySummaryService;
    //SalaryInformationRepository salaryInformationRepository;

    @Test
    void testCalculateMonthlySalary() {
//        payrollService.calculateMonthlySalary(
//                "EMP010",
//                LocalDate.of(2023, 8, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2023, 8, 1), //monthStart
//                LocalDate.of(2023, 8, 31)  //monthEnd
//        );
//        attMonthSummaryService.createMonthSummary("EMP010", LocalDate.of(2023, 8, 31));

                payrollService.calculateMonthlySalary(
                "EMP001",
                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
                LocalDate.of(2025, 9, 1), //monthStart
                LocalDate.of(2025, 9, 30)  //monthEnd
        );
//        payrollService.calculateMonthlySalary(
//                "EMP002",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );
//        payrollService.calculateMonthlySalary(
//                "EMP003",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );
//        payrollService.calculateMonthlySalary(
//                "EMP004",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );
//        payrollService.calculateMonthlySalary(
//                "EMP005",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );
//        payrollService.calculateMonthlySalary(
//                "EMP006",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );
//        payrollService.calculateMonthlySalary(
//                "EMP007",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );
//        payrollService.calculateMonthlySalary(
//                "EMP008",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );
//        payrollService.calculateMonthlySalary(
//                "EMP009",
//                LocalDate.of(2025, 9, 1),   // tháng tính lương để lấy monthSumary
//                LocalDate.of(2025, 9, 1), //monthStart
//                LocalDate.of(2025, 9, 30)  //monthEnd
//        );





//          attDailySummaryService.createDailySummary("EMP001", LocalDate.of(2025, 11, 16));

    }
}

