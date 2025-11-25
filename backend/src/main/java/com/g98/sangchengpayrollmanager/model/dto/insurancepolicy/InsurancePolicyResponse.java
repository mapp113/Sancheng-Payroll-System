package com.g98.sangchengpayrollmanager.model.dto.insurancepolicy;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class InsurancePolicyResponse {
    private Integer insurancePolicyId;
    private String insurancePolicyName;
    private BigDecimal employeePercentage;
    private BigDecimal companyPercentage;
    private Integer maxAmount;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    private boolean active;

}
