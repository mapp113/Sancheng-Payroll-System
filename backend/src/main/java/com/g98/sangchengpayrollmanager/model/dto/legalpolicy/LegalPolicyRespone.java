package com.g98.sangchengpayrollmanager.model.dto.legalpolicy;


import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LegalPolicyRespone {

    private Integer id;
    private String code;
    private String description;
    private String calculationType;
    private String applyScope;

    private Integer amount;
    private Double percent;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
