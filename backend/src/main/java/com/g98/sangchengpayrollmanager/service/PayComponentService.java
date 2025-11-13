package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.payroll.PaySummaryComponentItem;
import com.g98.sangchengpayrollmanager.model.entity.LegalPolicy;
import com.g98.sangchengpayrollmanager.model.entity.PayComponent;
import com.g98.sangchengpayrollmanager.model.entity.PayComponentType;
import com.g98.sangchengpayrollmanager.model.enums.CalculationType;
import com.g98.sangchengpayrollmanager.model.enums.PaySummaryComponentType;
import com.g98.sangchengpayrollmanager.model.enums.TaxTreatmentCode;
import com.g98.sangchengpayrollmanager.repository.LegalPolicyGroupRepository;
import com.g98.sangchengpayrollmanager.repository.LegalPolicyRepository;
import com.g98.sangchengpayrollmanager.repository.PayComponentRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PayComponentService {

    private final PayComponentRepository payComponentRepository;
    private final LegalPolicyRepository legalPolicyRepository;
    private final LegalPolicyGroupRepository legalPolicyGroupRepository;


/*
 Các field tính ra:
 *   totalAddition        : tổng tất cả khoản cộng thêm (isAddition = true)
 *   totalDeduction       : tổng tất cả khoản trừ (isAddition = false)
 *
 *   taxableAddition      = taxableImmediate (vượt cap riêng) + taxableFromGroup (vượt cap nhóm)
 *   nonTaxableAddition   = totalAddition - taxableAddition
 *
 *   insuredBaseExtra     : khoản cộng được tính vào base đóng bảo hiểm
 */

    public Result calculate(String employeeCode, LocalDate periodStart, LocalDate periodEnd) {
        // tìm các component active trong tháng
        List<PayComponent> components = payComponentRepository.findActive(employeeCode, periodStart, periodEnd);
        List<PaySummaryComponentItem> paySummaryComponentItems = new ArrayList<>();
        long totalAddition = 0L;
        long totalDeduction = 0L;
        long taxableAddition = 0L;
        long nonTaxableAddition = 0L;
        long insuredBaseExtra = 0L;

        // Danh sách tạm cho phase 2 (group). Mỗi phần tử = 1 component sau khi áp policy SINGLE.
        List<ComponentPortion> portionList = new ArrayList<>();

        // --- Tinh totalAddition, totalDeduction, insuredBaseExtra, chuyển các pay_component thành component_portion để tính taxableAddition
        for (PayComponent pc : components) {
            long amount = (pc.getValue() == null) ? 0L : pc.getValue().longValue();
            if (amount == 0L) continue;

            PayComponentType type = pc.getType();
            boolean isAddition = Boolean.TRUE.equals(pc.getIsAddition());
            boolean isInsured = (type != null && Boolean.TRUE.equals(type.getIsInsured()));

            if (!isAddition) {
                // khoản trừ
                totalDeduction += amount;

                // snapshot luôn deduction
                paySummaryComponentItems.add(
                        PaySummaryComponentItem.builder()
                                .componentName(pc.getName())
                                .componentType(PaySummaryComponentType.DEDUCTION.name())
                                .amount((int) amount)   // âm để dễ đọc
                                .note("")
                                .build()
                );
                continue;
            }

            // khoản cộng
            totalAddition += amount;

            //Bh
            if (isInsured) {
                insuredBaseExtra += amount;
            }

            // --- Áp policy SINGLE (cap riêng của chính loại phụ cấp này), nếu có ---
            LegalPolicy singlePolicy = (type != null ? type.getPolicy() : null);
            String treatmentCode = (type != null ? type.getTaxTreatmentCode() : null);

            ComponentPortion portion = splitBySinglePolicy(
                    (type != null ? type.getId() : null),
                    amount,
                    singlePolicy,
                    treatmentCode
            );
            portionList.add(portion);

            // Thêm chi tiết từng loại paycomponent
            paySummaryComponentItems.add(
                    PaySummaryComponentItem.builder()
                            .componentName(pc.getName())     // name of component
                            .componentType(pc.getIsAddition()? PaySummaryComponentType.ADDITION.name() : PaySummaryComponentType.DEDUCTION.name())
                            .amount((int)amount)
                            .note("")
                            .build()
            );
        }

        for(ComponentPortion p : portionList) {
            System.out.println("p.componentTypeId = " + p.getComponentTypeId() + ", p.grossAmount = " + p.getGrossAmount() + ", p.taxableImmediate = " + p.getTaxableImmediate() + ", p.eligibleForGroup = " + p.getEligibleForGroup());
        }

        // --- Tính taxableAddition, nonTaxableAddition ---
        //taxableAddition = taxableImmediateSum + taxableFromGroup

        // Tính taxableImmediateSum
        long taxableImmediateSum = 0L;
        for (ComponentPortion p : portionList) {
            taxableImmediateSum += p.getTaxableImmediate();
        }

        // Tính taxableFromGroup
        long taxableFromGroup = 0L;
        //   load group mapping từ DB.
        //   key   = groupPolicyCode (ví dụ "POLICY_PHUCLOI_2TR")
        //   value = list componentTypeId thuộc group đó
        Map<String, List<Integer>> groupMembers = legalPolicyGroupRepository.loadGroupMapping();
        for (Map.Entry<String, List<Integer>> entry : groupMembers.entrySet()) {
            String groupPolicyCode = entry.getKey();
            List<Integer> memberTypeIds = entry.getValue();

            System.out.println("groupPolicyCode = " + groupPolicyCode );
            for(Integer typeId : memberTypeIds) {
                System.out.println("componentTypeId = " + typeId);
            }

            long groupTotalEligible = 0L;

            // Cộng eligibleForGroup của tất cả component thuộc group này
            for (ComponentPortion p : portionList) {
                Integer tId = p.getComponentTypeId();
                if (tId != null && memberTypeIds.contains(tId)) {
                    groupTotalEligible += p.getEligibleForGroup();
                }
            }

            System.out.println("groupTotalEligible = " + groupTotalEligible);

            // Lấy policy GROUP (cap/tỷ lệ nhóm)
            // lấy ra policy loại group với effective_from <= periodEnd <= effective_to của policy
            LegalPolicy groupPolicy = legalPolicyRepository.findActiveByCode(groupPolicyCode, periodEnd); //
            System.out.println("groupPolicy = " + groupPolicy.getCode());
            if (groupPolicy == null) {
                continue;
            }

            String calculationType = groupPolicy.getCalculationType();
            CalculationType calculationTypeCheck = CalculationType.fromString(calculationType);
            if (calculationTypeCheck == null
                    || calculationTypeCheck != CalculationType.TAX_CAP_RATIO_CALCULATE) {
                continue;
            }
            // tính phần taxable theo group
            long taxableGroupPart = calcTaxableByPolicy(
                    groupPolicy,
                    calculationType,
                    groupTotalEligible
            );

            taxableFromGroup += taxableGroupPart;
        }
        taxableAddition = taxableImmediateSum + taxableFromGroup;
        System.out.println("taxableAddition: " + taxableAddition);
        System.out.println("taxableImmediateSum: " + taxableImmediateSum);
        System.out.println("taxableFromGroup: " + taxableFromGroup);
        nonTaxableAddition = totalAddition - taxableAddition;

        // 4. Build result
        return Result.builder()
                .totalAddition(toInt(totalAddition))
                .totalDeduction(toInt(totalDeduction))
                .taxableAddition(toInt(taxableAddition))
                .nonTaxableAddition(toInt(nonTaxableAddition))
                .insuredBaseExtra(toInt(insuredBaseExtra))
                .paySummaryComponentItems(paySummaryComponentItems)
                .build();
    }

    //=======Tinh taxable theo policy Group
    private long calcTaxableByPolicy(
            LegalPolicy policy,
            String calculationType,
            long groupTotalEligible
    ) {
        if (groupTotalEligible <= 0L) return 0L;

        if (policy == null) {
            // thiếu config -> đánh thuế hết (bảo thủ)
            return groupTotalEligible;
        }

        // chỉ xử lý loại TAX_CAP_RATIO_CALCULATE
        CalculationType calculationTypeCheck = CalculationType.fromString(calculationType);
        if (calculationTypeCheck == null || calculationTypeCheck != CalculationType.TAX_CAP_RATIO_CALCULATE) {
            return 0L;
        }

        Long cap = (policy.getAmount() != null)
                ? policy.getAmount().longValue()
                : null;

        Double ratio = (policy.getPercent() != null)
                ? policy.getPercent().doubleValue()
                : null;

        if (cap == null && ratio == null) {
            return groupTotalEligible;
        }

        if (cap == null && ratio != null) {
            long taxPart = Math.round(groupTotalEligible * ratio);
            return Math.max(taxPart, 0L);
        }

        if (cap != null && ratio == null) {
            long exceed = groupTotalEligible - cap;
            return Math.max(exceed, 0L);
        }

        // cap != null && ratio != null
        long exceed = groupTotalEligible - cap;
        if (exceed <= 0L) return 0L;

        long taxPart = Math.round(exceed * ratio);
        return Math.max(taxPart, 0L);

    }

    // chuyển pay_component thành component_portion để tính taxableAddition
    private ComponentPortion splitBySinglePolicy(
            Integer componentTypeId,
            long amount,
            LegalPolicy singlePolicy,
            String treatmentCode
    ) {
        if (amount <= 0L) {
            return ComponentPortion.builder()
                    .componentTypeId(componentTypeId)
                    .grossAmount(amount)
                    .taxableImmediate(0L)
                    .eligibleForGroup(0L)
                    .build();
        }

        TaxTreatmentCode treatment = TaxTreatmentCode.fromString(treatmentCode);
        // đánh thuế toàn phần
        if (singlePolicy == null && treatment == TaxTreatmentCode.FULLY_TAXABLE) {
            return ComponentPortion.builder()
                    .componentTypeId(componentTypeId)
                    .grossAmount(amount)
                    .taxableImmediate(amount)
                    .eligibleForGroup(0L)
                    .build();
        }

        // Default: nếu không có policy riêng => tất cả tiền được coi hợp lệ cho group
        if (singlePolicy == null) {
            return ComponentPortion.builder()
                    .componentTypeId(componentTypeId)
                    .grossAmount(amount)
                    .taxableImmediate(0L)
                    .eligibleForGroup(amount)
                    .build();
        }

        // lấy cap / ratio từ policy
        Long cap = (singlePolicy.getAmount() != null)
                ? singlePolicy.getAmount().longValue()
                : null;

        Double ratio = (singlePolicy.getPercent() != null)
                ? singlePolicy.getPercent().doubleValue()
                : null;


        // Nếu không chỉ định treatmentCode mà có singlePolicy -> coi như PARTIAL_CAP_RATIO (bảo thủ)
        if (treatment == null) {
            treatment = TaxTreatmentCode.PARTIAL_CAP_RATIO;
        }

        long taxableImmediate;
        long eligibleForGroup;

        if (treatment == TaxTreatmentCode.FULLY_TAXABLE) {
            // đánh thuế toàn bộ
            taxableImmediate = amount;
            eligibleForGroup = 0L;

        } else if (treatment == TaxTreatmentCode.NON_TAXABLE) {
            taxableImmediate = 0L;
            eligibleForGroup = amount;

        }else if (treatment == TaxTreatmentCode.PARTIAL_CAP_RATIO) {

            // Các nhánh giống logic trước
            if (cap == null && ratio == null) {
                // không rule rõ -> đánh thuế hết
                taxableImmediate = amount;
                eligibleForGroup = 0L;

            } else if (cap == null && ratio != null) {
                // chỉ ratio: 1 phần % chịu thuế
                long taxPart = Math.round(amount * ratio);
                taxableImmediate = Math.max(taxPart, 0L);

                long remain = amount - taxableImmediate;
                eligibleForGroup = Math.max(remain, 0L);

            } else if (cap != null && ratio == null) {
                // chỉ cap: phần vượt cap chịu thuế 100%
                long exceed = amount - cap;
                taxableImmediate = Math.max(exceed, 0L);

                long remain = amount - taxableImmediate;
                eligibleForGroup = Math.max(remain, 0L);

            } else {
                // cap != null && ratio != null
                long exceed = amount - cap;
                if (exceed <= 0L) {
                    taxableImmediate = 0L;
                    eligibleForGroup = amount;
                } else {
                    long taxPart = Math.round(exceed * ratio);
                    taxPart = Math.max(taxPart, 0L);

                    taxableImmediate = taxPart;

                    long remain = amount - taxableImmediate;
                    eligibleForGroup = Math.max(remain, 0L);
                }
            }

        } else {
            // fallback: nếu gặp treatmentCode lạ -> đánh thuế hết
            taxableImmediate = amount;
            eligibleForGroup = 0L;
        }

        return ComponentPortion.builder()
                .componentTypeId(componentTypeId)
                .grossAmount(amount)
                .taxableImmediate(taxableImmediate)
                .eligibleForGroup(eligibleForGroup)
                .build();
    }

    private Integer toInt(long value) {
        return (int) Math.min(value, Integer.MAX_VALUE);
    }

    @lombok.Builder
    @lombok.Getter
    private static class ComponentPortion {
        private final Integer componentTypeId;
        private final long grossAmount;
        private final long taxableImmediate;
        private final long eligibleForGroup;
    }

    @lombok.Builder
    @lombok.Getter
    public static class Result {
        private final Integer totalAddition;   //tính gross
        private final Integer totalDeduction;  //tính deduction
        private final Integer taxableAddition; //phần bị tính thuế của component dùng để tính thu nhập chịu thuế
        private final Integer nonTaxableAddition; // phần không bị tính thuế
        private final Integer insuredBaseExtra;   // phần tính BH
        private final List<PaySummaryComponentItem> paySummaryComponentItems;
    }
}
