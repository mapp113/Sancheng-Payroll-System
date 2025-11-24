package com.g98.sangchengpayrollmanager.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class LeaveQuotaYearSummaryResponse {
    private String employeeCode;
    private String employeeName;
    private Integer year;
    private List<LeaveQuotaDTO> quotas;

}
