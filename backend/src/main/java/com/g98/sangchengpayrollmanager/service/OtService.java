package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.AttDailySummary;
import com.g98.sangchengpayrollmanager.model.entity.AttMonthSummary;
import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OtService {

    public int getTotalOtAmount(
            List<AttDailySummary> adsList,
            List<SalaryInformation> salaryInformationList,
            AttMonthSummary ams
    ) {
        int normal = getTotalOtNormalPort(adsList, salaryInformationList, ams);
        int extra = getTotalOtExtraPort(adsList, salaryInformationList, ams);
        System.out.println("normal: " + normal + ", extra: " + extra);
        return normal + extra;
    }

    //phần OT bị tính thuế
    public int getTotalOtNormalPort(
            List<AttDailySummary> adsList,
            List<SalaryInformation> salaryInformationList,
            AttMonthSummary ams
    ) {
        BigDecimal total = BigDecimal.ZERO;

        for (AttDailySummary ads : adsList) {
            Integer otHour = ads.getOtHour();
            if (otHour == null || otHour <= 0) continue;

            SalaryInformation si = findSalaryInfoForDate(salaryInformationList, ads.getDate());
            if (si == null) continue;

//            BigDecimal baseHourly = BigDecimal.valueOf(si.getBaseSalary()/ams.getDayStandard());
            BigDecimal baseHourly =
                    BigDecimal.valueOf(si.getBaseSalary())
                            .divide(ams.getDayStandard().multiply(BigDecimal.valueOf(8)), 0, RoundingMode.HALF_UP);

            total = total.add(baseHourly.multiply(BigDecimal.valueOf(otHour)));
        }

        return total.setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    // phần Ot miễn thiếu
    public int getTotalOtExtraPort(
            List<AttDailySummary> adsList,
            List<SalaryInformation> salaryInformationList,
            AttMonthSummary ams
    ) {
        BigDecimal total = BigDecimal.ZERO;

        for (AttDailySummary ads : adsList) {
            Integer otHour = ads.getOtHour();
            if (otHour == null || otHour <= 0) continue;

            SalaryInformation si = findSalaryInfoForDate(salaryInformationList, ads.getDate());
            if (si == null) continue;

            BigDecimal otRate = ads.getDayType() != null && ads.getDayType().getOtRate() != null
                    ? ads.getDayType().getOtRate()
                    : BigDecimal.ONE;

//            BigDecimal baseHourly = BigDecimal.valueOf(si.getBaseHourlyRate());
            BigDecimal baseHourly =
                    BigDecimal.valueOf(si.getBaseSalary())
                            .divide(ams.getDayStandard().multiply(BigDecimal.valueOf(8)), 0, RoundingMode.HALF_UP);

            BigDecimal rateExtra = otRate.subtract(BigDecimal.ONE);
            if (rateExtra.compareTo(BigDecimal.ZERO) < 0) rateExtra = BigDecimal.ZERO;

            total = total.add(baseHourly.multiply(rateExtra).multiply(BigDecimal.valueOf(otHour)));
        }

        return total.setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    private SalaryInformation findSalaryInfoForDate(
            List<SalaryInformation> salaryInformationList,
            LocalDate date
    ) {
        for (SalaryInformation si : salaryInformationList) {
            LocalDate from = si.getEffectiveFrom();
            LocalDate to = si.getEffectiveTo(); // có thể null

            boolean afterStart = !date.isBefore(from); // date >= from
            boolean beforeEnd = (to == null) || !date.isAfter(to); // to == null || date <= to

            if (afterStart && beforeEnd) {
                return si;
            }
        }
        return null;
    }

}
