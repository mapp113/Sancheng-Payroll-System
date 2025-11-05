package com.g98.sangchengpayrollmanager.model.dto.leave;

import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.model.enums.LeaveStatus;
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
    private LeaveType leaveType;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private DurationType duration;
    private String title;
    private LeaveStatus status;
    private LocalDate approvalDate;
    private String reason;

}
