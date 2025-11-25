package com.g98.sangchengpayrollmanager.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class MonthlyOvertimeDTO {
    private Integer month;
    private Integer hours;
}