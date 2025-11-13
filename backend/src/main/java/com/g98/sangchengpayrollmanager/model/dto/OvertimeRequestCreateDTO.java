package com.g98.sangchengpayrollmanager.model.dto;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OvertimeRequestCreateDTO {
    private String employeeCode;
    private LocalDateTime fromTime;
    private LocalDateTime toTime;
    private String reason;



}
