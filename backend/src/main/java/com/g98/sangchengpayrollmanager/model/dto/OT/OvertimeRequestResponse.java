package com.g98.sangchengpayrollmanager.model.dto.OT;


import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OvertimeRequestResponse {

    private Integer id;
    private String employeeCode;
    private String fullName;

    private LocalDate otDate;
    private LocalDateTime fromTime;
    private LocalDateTime toTime;
    private Integer workedTime;
    private Integer dayTypeId;

    private String reason;


    private LeaveandOTStatus status;
    private LocalDateTime createdDateOT;
    private LocalDateTime approvedDateOT;
    private String note;
}
