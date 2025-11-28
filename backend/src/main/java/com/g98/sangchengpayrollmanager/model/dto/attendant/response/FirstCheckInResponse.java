package com.g98.sangchengpayrollmanager.model.dto.attendant.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FirstCheckInResponse {
    private String employeeCode;
    private LocalDate date;
    private LocalTime firstCheckIn;
}
