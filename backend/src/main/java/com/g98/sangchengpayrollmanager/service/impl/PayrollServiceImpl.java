package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import com.g98.sangchengpayrollmanager.model.entity.PaySummary;
import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import com.g98.sangchengpayrollmanager.model.entity.TaxLevel;
import com.g98.sangchengpayrollmanager.repository.*;
import com.g98.sangchengpayrollmanager.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final SalaryInformationRepository salaryRepo;
    private final AttMonthSummaryRepository attMonthRepo;
    private final PayComponentRepository payComponentRepo;
    private final InsurancePolicyRepository insuranceRepo;
    private final TaxLevelRepository taxRepo;
    private final PaySummaryRepository paySummaryRepo;

    @Transactional
    public PaySummary calculateMonthlySalary(String employeeCode, LocalDate month) {
        // 1. Lấy thông tin cơ bản
        //SalaryInformation salary = salaryRepo.findActiveByEmployeeCode(employeeCode);

        //var att = attMonthRepo.findByUserEmployeeCodeAndMonth(employeeCode, month);

        // 2. Lương cơ bản = baseSalary * (daysPayable / dayStandard)
//        int basePay = (int) (salary.getBaseSalary() *
//                (att.getDaysPayable().doubleValue() / att.getDayStandard().doubleValue()));

        // 3. Lương OT = otHours * baseHourlyRate * 1.5
        //int otAmount = (int) (att.getOtHours() * salary.getBaseHourlyRate() * 1.5);

        // 4. Phụ cấp & khấu trừ khác
        //int allowances = payComponentRepo.sumAllowances(employeeCode, month);
        //int deductions = payComponentRepo.sumDeductions(employeeCode, month);

        // 5. BHXH, Thuế TNCN
        //int insurance = calculateInsurance(basePay, insuranceRepo.findAll());
        //int tax = calculateTax(basePay - insurance - deductions, taxRepo.findAll());

        // 6. Tổng kết
        //int grossIncome = basePay + otAmount + allowances;
        //int netSalary = grossIncome - insurance - tax - deductions;

//        PaySummary summary = PaySummary.builder()
//                .date(month)
//                .grossIncome(grossIncome)
//                .taxAmount(tax)
//                .bhAmount(insurance)
//                .netSalary(netSalary)
//                .otHour(att.getOtHours())
//                .otAmount(otAmount)
//                .status("APPROVED")
//                .salaryInformation(salary)
//                .build();

//        return paySummaryRepo.save(summary);
        return null;
    }

    private int calculateInsurance(int basePay, List<InsurancePolicy> policies) {
        return policies.stream()
                .mapToInt(p -> (int) Math.min(basePay * p.getEmployeePercentage().doubleValue(), p.getMaxAmount()))
                .sum();
    }

    private int calculateTax(int taxable, List<TaxLevel> levels) {
        for (TaxLevel level : levels) {
            if (taxable <= level.getToValue()) {
                return (int) (taxable * level.getPercentage().doubleValue());
            }
        }
        return 0;
    }
}

