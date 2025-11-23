package com.g98.sangchengpayrollmanager.model.dto.taxlevel;

import lombok.*;

import java.math.BigDecimal;


@Getter
@Setter
@Builder
public class TaxLevelResponse {
    private Integer id;
    private String name;
    private Integer fromValue;
    private Integer toValue;
    private BigDecimal percentage;
}
