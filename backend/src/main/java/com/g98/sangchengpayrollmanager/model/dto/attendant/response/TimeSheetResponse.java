package com.g98.sangchengpayrollmanager.model.dto.attendant.response;

public record TimeSheetResponse(
    String employeeCode,
    String fullName,
    String positionName,
    Integer daysHours,
    Integer otHours
) {
}
