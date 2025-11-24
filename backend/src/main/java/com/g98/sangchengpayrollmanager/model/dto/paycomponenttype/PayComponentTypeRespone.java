package com.g98.sangchengpayrollmanager.model.dto.paycomponenttype;


import com.g98.sangchengpayrollmanager.model.entity.LegalPolicy;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PayComponentTypeRespone {

    private Integer id;
    private String name;
    private String description;

    private Boolean isFixed;
    private Boolean isTaxed;
    private Boolean isInsured;

    private String taxTreatmentCode;

    private String policyCode;
}
