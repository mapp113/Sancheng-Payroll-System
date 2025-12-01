package com.g98.sangchengpayrollmanager.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractUploadResponse {
    private String fileName;
    private Long fileSize;
    private String uploadedAt;
    private String message;
    private String downloadUrl; // URL để download PDF
    private String viewUrl;     // URL để xem PDF
}