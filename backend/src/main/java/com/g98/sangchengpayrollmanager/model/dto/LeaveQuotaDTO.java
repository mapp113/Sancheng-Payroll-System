package com.g98.sangchengpayrollmanager.model.dto;


import lombok.Data;

import java.util.List;


@Data
public class LeaveQuotaDTO {

    private String leaveTypeCode;
    private String leaveTypeName;
    private Double entitledDays;
    private Double carriedOver;
    private Double usedDays;
    private Double remainingDays;

}

