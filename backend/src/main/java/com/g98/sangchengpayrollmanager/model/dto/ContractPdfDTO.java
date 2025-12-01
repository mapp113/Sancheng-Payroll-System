package com.g98.sangchengpayrollmanager.model.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContractPdfDTO {
    private String fileName;
    private byte[] content;
    private Long size;
    private String source; // "database" hoặc "file"
}