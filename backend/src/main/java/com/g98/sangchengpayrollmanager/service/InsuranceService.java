package com.g98.sangchengpayrollmanager.service;


import com.g98.sangchengpayrollmanager.model.dto.payroll.PaySummaryComponentItem;
import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import com.g98.sangchengpayrollmanager.model.enums.PaySummaryComponentType;
import com.g98.sangchengpayrollmanager.repository.InsurancePolicyRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private final InsurancePolicyRepository insuranceRepository;

    /**
     * Tính tổng các khoản bảo hiểm (BHXH, BHYT, BHTN,...)
     * Dựa trên bảng insurance_policy đang active.
     * Không ghi DB — chỉ trả về kết quả tính toán để PayrollService sử dụng.
     *
     * @param insuranceBase  lương tính bảo hiểm = baseSalary + insuredBaseExtra
     * @return Result gồm tổng bảo hiểm, chi tiết từng loại, và phần công ty chịu
     */
    public Result calculateInsurance(int insuranceBase, LocalDate payrollDate) {

        // tránh lỗi
        if (insuranceBase <= 0) {
            return Result.builder()
                    .insuranceBase(insuranceBase)
                    .employeeInsurance(0)
                    .companyInsurance(0)
                    .paySummaryComponentItems(List.of())
                    .build();
        }

        // Lấy các policy đang có hiệu lực tại payrollDate
        List<InsurancePolicy> policies = insuranceRepository.findActivePolicies(payrollDate);
        List<PaySummaryComponentItem> components = new ArrayList<>();

        long totalEmployeeShare = 0L;
        long totalCompanyShare = 0L;

        for (InsurancePolicy policy : policies) {
            // Giới hạn trần (nếu có)
            long cappedBase = Math.min(
                    insuranceBase,
                    (policy.getMaxAmount() != null) ? policy.getMaxAmount().longValue() : insuranceBase
            );

            double empPercent = (policy.getEmployeePercentage() != null)
                    ? policy.getEmployeePercentage().doubleValue() : 0.0;
            double comPercent = (policy.getCompanyPercentage() != null)
                    ? policy.getCompanyPercentage().doubleValue() : 0.0;

            long empAmt = Math.round(cappedBase * empPercent);
            long comAmt = Math.round(cappedBase * comPercent);

            totalEmployeeShare += empAmt;
            totalCompanyShare += comAmt;

            // Ghi chú ví dụ: "8.00% trên 5,000,000 (trần 20,000,000)"
            String note = String.format("%.2f%% trên %,d (trần %,d)",
                    empPercent * 100, cappedBase,
                    (policy.getMaxAmount() != null) ? policy.getMaxAmount().intValue() : cappedBase
            );

            // Thêm chi tiết từng loại bảo hiểm
            components.add(
                    PaySummaryComponentItem.builder()
                            .componentName(policy.getName())     // ví dụ: "BHXH", "BHYT"
                            .componentType(PaySummaryComponentType.INSURANCE.name())          // cố định loại này
                            .amount((int) empAmt)                // phần nhân viên đóng
                            .note(note)
                            .build()
            );
        }

        return Result.builder()
                .insuranceBase(insuranceBase)
                .employeeInsurance((int) totalEmployeeShare)
                .companyInsurance((int) totalCompanyShare)
                .paySummaryComponentItems(components)
                .build();
    }

    // Kết quả trả về cho bước 7 trong PayrollService
    @Getter
    @Builder
    public static class Result {
        private final Integer insuranceBase;             // Lương tính bảo hiểm
        private final Integer employeeInsurance;         // Tổng nhân viên phải đóng
        private final Integer companyInsurance;          // Tổng công ty phải đóng
        private final List<PaySummaryComponentItem> paySummaryComponentItems; // Chi tiết từng loại BH
    }
}

