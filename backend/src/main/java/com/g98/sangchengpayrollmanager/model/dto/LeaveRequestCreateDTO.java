package com.g98.sangchengpayrollmanager.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;


@Data

public class LeaveRequestCreateDTO {

   // private String fullName;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @NotNull
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    private String leaveType;

    @NotNull
    private String duration;


    private String reason;

    private MultipartFile attachment;



}
