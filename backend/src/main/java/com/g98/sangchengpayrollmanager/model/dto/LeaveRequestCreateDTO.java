package com.g98.sangchengpayrollmanager.model.dto;

import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import lombok.*;
import org.antlr.v4.runtime.misc.NotNull;

import java.time.LocalDate;


@Data

public class LeaveRequestCreateDTO {

    private String employeeCode;
    private String fullName;

    @NotNull
    private LocalDate fromdate;

    @NotNull
    private LocalDate todate;

    @NotNull
    private DurationType duration;

    @NotNull
    private String title;
    private String description;

}
