package com.g98.sangchengpayrollmanager.model.dto;


import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class TaxLevelDTO {
    private String name;
    private Integer fromValue;
    private Integer toValue;
    private BigDecimal percentage;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
