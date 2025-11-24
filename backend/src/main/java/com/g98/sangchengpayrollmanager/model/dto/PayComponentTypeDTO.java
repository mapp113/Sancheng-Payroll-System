package com.g98.sangchengpayrollmanager.model.dto;


import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PayComponentTypeDTO {

    private String name;
    private String description;
    private Boolean isTaxed;
    private Boolean isInsured;

    private String taxTreatmentCode;
    private String policyCode;
}
