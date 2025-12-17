package com.g98.sangchengpayrollmanager.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractTemplateDTO {
    private String fileName;
    private byte[] content;
    private Long size;
}