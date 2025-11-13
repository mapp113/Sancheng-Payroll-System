package com.g98.sangchengpayrollmanager;

import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import com.g98.sangchengpayrollmanager.repository.SalaryInformationRepository;
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
    //SalaryInformationRepository salaryInformationRepository;

    @Test
    void testCalculateMonthlySalary() {
        payrollService.calculateMonthlySalary(
                "EMP001",
                LocalDate.of(2025, 10, 1),   // tháng tính lương để lấy monthSumary
                LocalDate.of(2025, 9, 15), //monthStart
                LocalDate.of(2025, 10, 15)  //monthEnd
        );



//        List<SalaryInformation> salaryInformations = salaryInformationRepository.findActiveByEmployeeCode("EMP001", LocalDate.of(2025, 9, 15), LocalDate.of(2025, 10, 31));
//        System.out.println("Số bản ghi tìm thấy: " + salaryInformations.size());
//        for (SalaryInformation s : salaryInformations) {
//            System.out.println(s);
//        }
    }
}

