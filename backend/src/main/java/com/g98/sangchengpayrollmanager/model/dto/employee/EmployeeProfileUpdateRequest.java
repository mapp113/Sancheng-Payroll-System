package com.g98.sangchengpayrollmanager.model.dto.employee;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeProfileUpdateRequest {
    private String fullName;
    private Integer positionId;
    private String personalEmail;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String contractType;
    private String phone;
    private String taxCode;
    private String status;
    private String citizenId;
    private String address;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joinDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate visaExpiry;

    private String contractUrl;

    private String dependentsNo;
}