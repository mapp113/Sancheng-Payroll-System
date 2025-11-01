package com.g98.sangchengpayrollmanager.model.dto.payroll.response;

public record PaySummaryComponentDto(
        String name,
        String type,
        int amount,
        String note
) {}
