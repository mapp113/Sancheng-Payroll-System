package com.g98.sangchengpayrollmanager.model.dto.payroll.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayComponentEndDateUpdateRequest {
    private LocalDate endDate;
}