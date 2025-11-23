package com.g98.sangchengpayrollmanager.model.dto;

import com.g98.sangchengpayrollmanager.model.entity.InsurancePolicy;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
public class InsurancePolicyDTO {

    private String insurancePolicyName;
    private BigDecimal employeePercentage;
    private BigDecimal companyPercentage;
    private Integer maxAmount;
}
