package com.g98.sangchengpayrollmanager.model.dto.leave;

import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class LeaveRequestResponse {
    private Integer id;
    private String employeeCode;
    private String fullName;
    private String leaveTypeCode;
    private String reason;
    private LocalDate fromDate;
    private LocalDate toDate;
    private DurationType duration;
    private boolean isPaidLeave;
    private LeaveandOTStatus status;
    private LocalDate approvalDate;
    private String note;
    private String file;
}
