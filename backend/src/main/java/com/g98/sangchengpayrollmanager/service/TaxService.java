package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.payroll.PaySummaryComponentItem;
import com.g98.sangchengpayrollmanager.model.entity.EmployeeInformation;
import com.g98.sangchengpayrollmanager.model.entity.LegalPolicy;
import com.g98.sangchengpayrollmanager.model.entity.TaxLevel;
import com.g98.sangchengpayrollmanager.model.enums.PaySummaryComponentType;
import com.g98.sangchengpayrollmanager.repository.EmployeeInformationRepository;
import com.g98.sangchengpayrollmanager.repository.LegalPolicyRepository;
import com.g98.sangchengpayrollmanager.repository.TaxLevelRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxService {

    private final EmployeeInformationRepository employeeInfoRepo;
    private final LegalPolicyRepository legalPolicyRepo;
    private final TaxLevelRepository taxLevelRepo;

    /**
     * Tính thuế TNCN tháng.
     *
     * @param employeeCode      mã nhân viên
     * @param assessableIncome  thu nhập tính thuế bước 6 (đã trừ khoản miễn thuế từ pay component + OT miễn)
     * @param employeeInsurance phần BH người lao động phải đóng (bước 7)
     * @param asOfDate          ngày để lấy policy đang hiệu lực (thường là cuối tháng lương)
     */
    public Result calculateTax(
            String employeeCode,
            int assessableIncome,
            int employeeInsurance,
            LocalDate asOfDate
    ) {

        List<PaySummaryComponentItem> items = new ArrayList<>();

        // 1. Lấy thông tin nhân viên để biết số người phụ thuộc
        EmployeeInformation empInfo = employeeInfoRepo.findByUserEmployeeCode(employeeCode);
        int dependentsNo = (empInfo != null && empInfo.getDependentsNo() != null)
                ? empInfo.getDependentsNo()
                : 0;

        // 2. Lấy chính sách giảm trừ bản thân & người phụ thuộc từ legal_policy
        // giả sử code là "PERSONAL_DEDUCTION" và "DEPENDENT_DEDUCTION"
        LegalPolicy personalPolicy =
                legalPolicyRepo.findActiveByCode("PERSONAL_DEDUCTION", asOfDate);
        LegalPolicy dependentPolicy =
                legalPolicyRepo.findActiveByCode("DEPENDENT_DEDUCTION", asOfDate);

        int personalDeduction = (personalPolicy != null && personalPolicy.getAmount() != null)
                ? personalPolicy.getAmount()
                : 0;
        int perDependentDeduction = (dependentPolicy != null && dependentPolicy.getAmount() != null)
                ? dependentPolicy.getAmount()
                : 0;
        int dependentsDeduction = perDependentDeduction * dependentsNo;

        // ghi snapshot giảm trừ
        if (personalDeduction > 0) {
            items.add(
                    PaySummaryComponentItem.builder()
                            .componentName("Giảm trừ bản thân")
                            .componentType(PaySummaryComponentType.TAX_DEDUCTION.name())
                            .amount(personalDeduction)
                            .note("")
                            .build()
            );
        }
        if (dependentsDeduction > 0) {
            items.add(
                    PaySummaryComponentItem.builder()
                            .componentName("Giảm trừ người phụ thuộc")
                            .componentType(PaySummaryComponentType.TAX_DEDUCTION.name())
                            .amount(dependentsDeduction)
                            .note("Số người phụ thuộc: " + dependentsNo)
                            .build()
            );
        }

        // 3. Thu nhập tính thuế (taxable income)
        int taxableIncome = assessableIncome
                - employeeInsurance      // BH người lao động đóng được trừ trước thuế
                - personalDeduction
                - dependentsDeduction;

        if (taxableIncome <= 0) {
            return Result.builder()
                    .taxableIncome(0)
                    .taxAmount(0)
                    .paySummaryComponentItems(items)
                    .build();
        }

        // 4. Lấy bậc thuế và tính theo lũy tiến
        List<TaxLevel> levels = taxLevelRepo.findAll();
        // để chắc kèo thì sort theo toValue tăng dần
        levels.sort(Comparator.comparing(TaxLevel::getToValue));

        int totalTax = 0;

        for (TaxLevel level : levels) {
            int to = level.getToValue();       // ví dụ: 5_000_000; 10_000_000 ...
            double percent = level.getPercentage().doubleValue(); // ví dụ 0.05, 0.1 ...
            int from = level.getFromValue();    // ví dụ: 0; 5_000_000; 10_000_000 ...
            if(taxableIncome <= to && taxableIncome >= from) {
                totalTax = (int) Math.ceil(taxableIncome * percent);
                break;
            }
            // nếu muốn snapshot từng bậc thì add ở đây (optional)
            // items.add(...)
        }

        // 5. add snapshot thuế
//        items.add(
//                PaySummaryComponentItem.builder()
//                        .componentName("Thuế TNCN")
//                        .componentType(PaySummaryComponentType.TAX.name())
//                        .amount(totalTax)
//                        .note("")
//                        .build()
//        );

        return Result.builder()
                .taxableIncome(taxableIncome)
                .taxAmount(totalTax)
                .paySummaryComponentItems(items)
                .build();
    }

    @Getter
    @Builder
    public static class Result {
        private final Integer taxableIncome;                 // thu nhập tính thuế sau giảm trừ
        private final Integer taxAmount;                     // số thuế phải nộp
        private final List<PaySummaryComponentItem> paySummaryComponentItems;  // để Payroll snapshot
    }
}

