package com.g98.sangchengpayrollmanager.model.dto.payroll.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class BatchSalaryResponse {
    private String message;
    private List<String> errors;
}

