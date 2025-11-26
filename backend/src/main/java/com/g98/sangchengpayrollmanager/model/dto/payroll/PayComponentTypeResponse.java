package com.g98.sangchengpayrollmanager.model.dto.payroll;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PayComponentTypeResponse {
    private Integer id;
    private String name;
    private String description;
}
