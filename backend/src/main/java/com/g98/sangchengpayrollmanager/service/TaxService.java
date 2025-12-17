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
            LocalDate asOfDate,
            LocalDate payrollDate
    ) {

        List<PaySummaryComponentItem> items = new ArrayList<>();

        // 1. Lấy thông tin nhân viên để biết số người phụ thuộc
        EmployeeInformation empInfo = employeeInfoRepo.findByUserEmployeeCode(employeeCode);
        int dependentsNo = (empInfo != null && empInfo.getDependentsNo() != null)
                ? empInfo.getDependentsNo()
                : 0;

        // 2. Lấy chính sách giảm trừ bản thân & người phụ thuộc từ legal_policy
        // giả sử code là "PERSONAL_DEDUCTION" và "DEPENDENT_DEDUCTION"
        List<LegalPolicy> taxDeductionlPolicy =
                legalPolicyRepo.findActiveByCalculationType("TAX_DEDUCTION", asOfDate);

        int personalDeduction = 0;
        int perDependentDeduction = 0;
        for (LegalPolicy policy : taxDeductionlPolicy) {
            if (policy.getCode().contains("PERSONAL_DEDUCTION")) {
                personalDeduction = (policy.getAmount() != null) ? policy.getAmount() : 0;
            } else if (policy.getCode().contains("DEPENDENT_DEDUCTION")) {
                perDependentDeduction = (policy.getAmount() != null) ? policy.getAmount() : 0;
            }
        }
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

        // 4. Lấy bậc thuế và tính theo lũy tiến từng phần
        List<TaxLevel> levels = taxLevelRepo.findActiveLevels(payrollDate);

        // Sort theo bậc (fromValue ASC)
        levels.sort(Comparator.comparing(TaxLevel::getFromValue));
        int totalTax = 0;

        for (TaxLevel level : levels) {

            int from = level.getFromValue();
            int to = level.getToValue();
            double percent = level.getPercentage().doubleValue();

            // Nếu thu nhập <= from thì không còn phần chịu thuế cho bậc này
            if (taxableIncome <= from) break;

            // Xác định phần thu nhập nằm trong bậc này
            int taxableInLevel = Math.min(taxableIncome, to) - from;

            if (taxableInLevel > 0) {
                int taxInLevel = (int) Math.round(taxableInLevel * percent);
                totalTax += taxInLevel;
                // Nếu bạn muốn snapshot từng bậc -> bật đoạn này
                /*
                    items.add(
                    PaySummaryComponentItem.builder()
                        .componentName("Thuế TNCN - " + level.getName())
                        .componentType(PaySummaryComponentType.TAX.name())
                        .amount(taxInLevel)
                        .note(String.format("%,d - %,d x %.2f%%",
                                from, Math.min(remaining, to), percent * 100))
                        .build()
                     );
                 */
            }
            // Nếu đã vượt qua bậc này, chuyển sang bậc tiếp theo
        }

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

