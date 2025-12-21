package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.*;
import com.g98.sangchengpayrollmanager.repository.PayComponentRepository;
import com.g98.sangchengpayrollmanager.repository.PayComponentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BaseSalaryService {
    private final PayComponentRepository payComponentRepository;
    private final PayComponentTypeRepository payComponentTypeRepository;

    public int calculateBaseSalaryAmt(LocalDate monthStart, LocalDate monthEnd, List<AttDailySummary> adsList, AttMonthSummary ams, List<SalaryInformation> salaryInformationList) {
        // Guard
        if (ams == null || salaryInformationList == null || salaryInformationList.isEmpty()) {
            return 0;
        }

        BigDecimal dayStandard = ams.getDayStandard();
        if (dayStandard == null || dayStandard.compareTo(BigDecimal.ZERO) == 0) {
            return 0;
        }

        // 2. Tính tổng lương cơ bản prorate
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (SalaryInformation si : salaryInformationList) {

            // giao khoảng hiệu lực lương với tháng đang tính
            LocalDate effFrom = si.getEffectiveFrom().isAfter(monthStart) ? si.getEffectiveFrom() : monthStart;
            LocalDate effTo = (si.getEffectiveTo() == null || si.getEffectiveTo().isAfter(monthEnd))
                    ? monthEnd : si.getEffectiveTo();

            if (effFrom.isAfter(effTo)) {
                continue;
            }

            // Số ngày (hoặc phần ngày) được trả lương trong đoạn hiệu lực này
            BigDecimal payableDays = calculatePayableDaysInRange(effFrom, effTo, adsList, ams, si);
            // payableDays là BigDecimal, ví dụ 5.5 ngày tương đương (có nửa ngày làm)

            // baseSalary của mức lương này
            BigDecimal baseSalary = BigDecimal.valueOf(si.getBaseSalary());

            // số tiền lương theo từng khoảng trong tháng
            // Lương cơ bản tháng(theo từng base) * (số ngày được trả của khoảng này / ngày công chuẩn tháng)
            BigDecimal prorated = baseSalary
                    .multiply(payableDays)                       // baseSalary * payableDays
                    .divide(dayStandard, 2, RoundingMode.HALF_UP); // rồi chia cho chuẩn ngày công của tháng

            totalAmount = totalAmount.add(prorated);
        }

        // 3. Trả int
        return totalAmount.setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    public BigDecimal calculatePayableDaysInRange(LocalDate from, LocalDate to, List<AttDailySummary> adsList, AttMonthSummary ams,SalaryInformation si ){
        if (from == null || to == null || adsList == null || ams == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal standardHoursPerDay = ams.getStandardHoursPerDay();
        if (standardHoursPerDay.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;

        int insurancePayForSick = 0;
        int insurancePayForMaternity = 0;

        for (AttDailySummary ads : adsList) {

            LocalDate d = ads.getDate();
            if (d == null) continue;

            // check d trong [from, to]
            boolean inRange = ( !d.isBefore(from) ) && ( !d.isAfter(to) );
            if (!inRange) {
                continue;
            }

            if(Objects.equals(ads.getLeaveTypeCode(), "sick")){
                int value = BigDecimal.valueOf(si.getBaseSalary())
                        .divide(ams.getDayStandard(), 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(0.75))
                        .setScale(0, RoundingMode.HALF_UP)
                        .intValue();
                insurancePayForSick += value;
                continue;
            }

            if(Objects.equals(ads.getLeaveTypeCode(), "maternity")){
                int value = BigDecimal.valueOf(si.getBaseSalary())
                        .divide(ams.getDayStandard(), 6, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(1))
                        .setScale(0, RoundingMode.HALF_UP)
                        .intValue();
                insurancePayForMaternity += value;
                continue;
            }

            // 1) nếu ngày này được trả full lương (is_payable_day = 1) => cộng 1.0
            if (ads.getIsPayableDay()) {
                total = total.add(BigDecimal.ONE);
                continue;
            }

            // 2) nếu không flag payable full day nhưng vẫn có giờ làm thực tế
            // tạm xử lí được OT only day với workHours = 0 chỉ ghi vào ot_hours
            Integer workHours = ads.getWorkHours();
            if (workHours != null && workHours > 0) {
                // fractionOfDay = workHours / standardHoursPerDay
                BigDecimal fractionOfDay = BigDecimal
                        .valueOf(workHours)
                        .divide(standardHoursPerDay, 1, RoundingMode.HALF_UP);

                // ví dụ làm 4/8h -> +0.5 ngày
                total = total.add(fractionOfDay);
            }
        }

        //tạo 1 component cho các khoản BHXH chi trả
        if (insurancePayForSick > 0) {
            YearMonth thisMonth = YearMonth.from(ams.getMonth());
            LocalDate startOfMonth = thisMonth.atDay(1);
            LocalDate endOfMonth = thisMonth.atEndOfMonth();

            PayComponentType bhxhType = payComponentTypeRepository.findByName("BHXH chi trả")
                    .orElseThrow(() -> new IllegalStateException("Missing PayComponentType: BHXH chi trả"));

            PayComponent pc = payComponentRepository
                    .findOneByEmployeeAndNameAndPeriod(si.getUser().getEmployeeCode(),
                            "BHXH nghỉ ốm", startOfMonth, endOfMonth)
                    .orElseGet(() -> PayComponent.builder()
                            .name("BHXH nghỉ ốm")
                            .description("BHXH chi trả do nghỉ ốm")
                            .user(si.getUser())
                            .type(bhxhType)
                            .startDate(startOfMonth)
                            .endDate(endOfMonth)
                            .occurrences(1)
                            .isAddition(true)
                            .build());

            pc.setValue(insurancePayForSick);
            payComponentRepository.save(pc);
        }

        if (insurancePayForMaternity > 0) {
            YearMonth thisMonth = YearMonth.from(ams.getMonth());
            LocalDate startOfMonth = thisMonth.atDay(1);
            LocalDate endOfMonth = thisMonth.atEndOfMonth();

            PayComponentType bhxhType = payComponentTypeRepository.findByName("BHXH chi trả")
                    .orElseThrow(() -> new IllegalStateException("Missing PayComponentType: BHXH chi trả"));

            PayComponent pc = payComponentRepository
                    .findOneByEmployeeAndNameAndPeriod(si.getUser().getEmployeeCode(),
                            "BHXH nghỉ thai sản", startOfMonth, endOfMonth)
                    .orElseGet(() -> PayComponent.builder()
                            .name("BHXH nghỉ thai sản")
                            .description("BHXH chi trả nghỉ thai sản")
                            .user(si.getUser())
                            .type(bhxhType)
                            .startDate(startOfMonth)
                            .endDate(endOfMonth)
                            .occurrences(1)
                            .isAddition(true)
                            .build());

            pc.setValue(insurancePayForMaternity);
            payComponentRepository.save(pc);
        }

        return total;
    }
}
