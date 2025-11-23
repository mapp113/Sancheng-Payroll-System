package com.g98.sangchengpayrollmanager.model.dto;


import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
public class TaxLevelDTO {
    private String name;
    private Integer fromValue;
    private Integer toValue;
    private BigDecimal percentage;
}
