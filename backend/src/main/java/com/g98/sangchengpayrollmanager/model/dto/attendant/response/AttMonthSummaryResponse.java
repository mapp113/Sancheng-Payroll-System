package com.g98.sangchengpayrollmanager.model.dto.attendant.response;

import java.math.BigDecimal;

public record AttMonthSummaryResponse (
        String employeeCode,
        String fullName,
        Integer daysHours,
        Integer otHours,
        Integer usedleave,
        BigDecimal dayStandard,
        BigDecimal daysMeal,
        BigDecimal daysTrial,
        BigDecimal daysPayable,
        Integer lateCount,
        Integer earlyLeaveCount
){
}
