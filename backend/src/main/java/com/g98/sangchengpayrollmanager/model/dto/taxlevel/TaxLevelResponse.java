package com.g98.sangchengpayrollmanager.model.dto.taxlevel;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;


@Getter
@Setter
@Builder
public class TaxLevelResponse {
    private Integer id;
    private String name;
    private Integer fromValue;
    private Integer toValue;
    private BigDecimal percentage;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    private boolean active;
}
