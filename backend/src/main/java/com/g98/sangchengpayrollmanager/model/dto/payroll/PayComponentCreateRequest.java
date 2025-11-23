package com.g98.sangchengpayrollmanager.model.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayComponentCreateRequest {
    private Integer typeId;
    private String name;
    private String description;
    private Integer value;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer occurrences;
    private Boolean isAddition;
    private BigDecimal percent;
}