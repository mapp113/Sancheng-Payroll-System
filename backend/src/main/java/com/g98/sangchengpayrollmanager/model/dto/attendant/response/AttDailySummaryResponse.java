package com.g98.sangchengpayrollmanager.model.dto.attendant.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AttDailySummaryResponse {
    private Integer id;
    private LocalDate date;
    private String dayTypeName;
    private Integer workHours;
    private Integer otHour;
    private Boolean isLateCounted;
    private Boolean isEarlyLeaveCounted;
    private Boolean isCountPayableDay;
    private Boolean isAbsent;
    private Boolean isDayMeal;
    private Boolean isTrialDay;
    private String leaveTypeCode;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    // getter/setter
}

