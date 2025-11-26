package com.g98.sangchengpayrollmanager.model.dto.payroll;

import java.time.LocalDate;

public record PayComponentResponse(
        Integer id,
        Integer typeId,
        String typeName,
        String name,
        Integer value,
        LocalDate startDate,
        LocalDate endDate
) {
}