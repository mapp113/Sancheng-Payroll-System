package com.g98.sangchengpayrollmanager.model.dto;

import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;


@Data

public class LeaveRequestCreateDTO {

    private String employeeCode;
   // private String fullName;

    @NotNull
    private LocalDate fromDate;

    @NotNull
    private LocalDate toDate;

    private String leaveType;

    @NotNull
    private String duration;

    private Boolean isPaidLeave;
    @NotNull
    private String reason;

    private String file;


}
