package com.g98.sangchengpayrollmanager.service.impl;


import com.g98.sangchengpayrollmanager.model.dto.payroll.PaySummaryComponentItem;
import com.g98.sangchengpayrollmanager.model.entity.*;
import com.g98.sangchengpayrollmanager.repository.*;
import com.g98.sangchengpayrollmanager.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final SalaryInformationRepository salaryRepo;
    private final AttMonthSummaryRepository attMonthRepo;
    private final PayComponentRepository payComponentRepo;
    private final InsurancePolicyRepository insuranceRepo;
    private final TaxLevelRepository taxRepo;
    private final PaySummaryRepository paySummaryRepo;
    private final AttDailySummaryRepository attDailyRepo;
    private final BaseSalaryService baseSalaryService;
    private final OtService otService;
    private final PayComponentService payComponentService;
    private final InsuranceService insuranceService;
    private final TaxService taxService;

    @Transactional
    public PaySummary calculateMonthlySalary(String employeeCode, LocalDate month, LocalDate monthStart, LocalDate monthEnd) {
        // 1. Lấy thông tin cơ bản
        List<SalaryInformation> salaryInformationList =
                salaryRepo.findActiveByEmployeeCode(employeeCode, monthStart, monthEnd);
        if (salaryInformationList.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy salary info active cho nhân viên " + employeeCode);
        }
        AttMonthSummary ams =
                attMonthRepo.findByUserEmployeeCodeAndMonth(employeeCode, month);
        List<AttDailySummary> adsList =
                attDailyRepo.findByUserEmployeeCodeAndDateBetween(employeeCode, monthStart, monthEnd);

        // list snapshot
        List<PaySummaryComponentItem> snapshot = new ArrayList<>();


        // 2. Lương cơ bản = baseSalary * (daysPayable / dayStandard)
        int baseSalaryAmount = baseSalaryService.calculateBaseSalaryAmt(monthStart, monthEnd, adsList, ams, salaryInformationList);

        // 3. tính OT
        int otAmount = otService.getTotalOtAmount(adsList, salaryInformationList);

        // 4. Phụ cấp, thưởng, deduction
        PayComponentService.Result pcResult =
                payComponentService.calculate(employeeCode, monthStart, monthEnd);
        snapshot.addAll(pcResult.getPaySummaryComponentItems());

        int totalAddition       = pcResult.getTotalAddition();        // khoản cộng thêm
        int totalDeduction      = pcResult.getTotalDeduction();       // khoản trừ nội bộ
        int taxableAddition     = pcResult.getTaxableAddition();      // phần addition phải tính thuế TNCN
        int nonTaxableAddition  = pcResult.getNonTaxableAddition();   // phần addition không tính thuế
        int insuredBaseExtra    = pcResult.getInsuredBaseExtra();     // phần cộng vào base đóng BH

        // 5. gross_income
        int grossIncome = baseSalaryAmount + otAmount + totalAddition;

        // 6.BHXH,BHYT,BHTN
        // lương tính bảo hiểm =  Lương cơ bản + insuredBaseExtra
        int insuranceBase = baseSalaryAmount + insuredBaseExtra;
        InsuranceService.Result insResult = insuranceService.calculateInsurance(insuranceBase);
        snapshot.addAll(insResult.getPaySummaryComponentItems());           // 👉 chỉ add thêm
        int employeeInsurance = insResult.getEmployeeInsurance();

        // 7.assessable_income
        int nonTaxableOtAmount = otService.getTotalOtExtraPort(adsList, salaryInformationList);
        int assessableIncome = grossIncome - nonTaxableAddition - nonTaxableOtAmount;
        System.out.println("grossIncome: " + grossIncome);
        System.out.println("nonTaxableOtAmount: " + nonTaxableOtAmount);
        System.out.println("nonTaxableAddition: " + nonTaxableAddition);

        // 8.taxable_income = assessableIncome - personalDeduction - dependentsDeduction - 7.BHXH,BHYT,BHTN;
        // 9.tax_amount
        TaxService.Result taxResult = taxService.calculateTax(employeeCode, assessableIncome, employeeInsurance, monthEnd);
        snapshot.addAll(taxResult.getPaySummaryComponentItems());
        int taxableIncome = taxResult.getTaxableIncome();
        int taxAmount = taxResult.getTaxAmount();
        // 10.net_salary
        int netSalary = grossIncome - taxAmount - employeeInsurance - totalDeduction;


        // 11. update draft hay tạo mới
        PaySummary summary = paySummaryRepo
                .findByUserEmployeeCodeAndDateAndStatus(employeeCode, month, "draft")
                .orElse(null);

        if (summary == null) {
            // chưa có draft -> tạo mới
            summary = PaySummary.builder()
                    .salaryInformation(salaryInformationList.get(0))
                    .date(month)
                    .status("draft")
                    .user(salaryInformationList.get(0).getUser())
                    .components(new ArrayList<>())
                    .build();
        } else {
            // đã có draft -> clear component cũ để add lại
            // yêu cầu entity PaySummary.components phải có cascade + orphanRemoval
            summary.getComponents().clear();
        }

        // set lại các field đã tính
        summary.setGrossIncome(grossIncome);
        summary.setAssessableIncome(assessableIncome);
        summary.setTaxableIncome(taxableIncome);
        summary.setTaxAmount(taxAmount);
        summary.setBhAmount(employeeInsurance);
        summary.setOtHour(ams.getOtHours());
        summary.setOtAmount(otAmount);
        summary.setNetSalary(netSalary);
        summary.setPayslipUrl("");
        summary.setBaseSalaryAmt(baseSalaryAmount);

        // convert snapshot -> entity
        for (PaySummaryComponentItem item : snapshot) {
            PaySummaryComponent psc = PaySummaryComponent.builder()
                    .paySummary(summary)
                    .user(salaryInformationList.get(0).getUser())
                    .componentName(item.getComponentName())
                    .componentType(item.getComponentType())
                    .amount(item.getAmount())
                    .note(item.getNote())
                    .build();
            summary.getComponents().add(psc);
        }

        return paySummaryRepo.save(summary);
    }



}

