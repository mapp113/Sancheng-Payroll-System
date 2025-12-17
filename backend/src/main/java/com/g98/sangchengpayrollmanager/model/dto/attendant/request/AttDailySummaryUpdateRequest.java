package com.g98.sangchengpayrollmanager.model.dto.attendant.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AttDailySummaryUpdateRequest {
    private Boolean isLateCounted;
    private Boolean isEarlyLeaveCounted;
    private Boolean isDayMeal;
    private Boolean isCountPayableDay;
    // sau này thêm field khác cứ bổ sung ở đây
}

