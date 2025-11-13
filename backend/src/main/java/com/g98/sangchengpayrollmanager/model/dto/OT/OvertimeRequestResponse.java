package com.g98.sangchengpayrollmanager.model.dto.OT;


import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OvertimeRequestResponse {
    private Integer id;
    private String employeeCode;
    private String fullName;
    private LocalDateTime fromTime;
    private LocalDateTime toTime;
    private Integer workedTime;
    private LeaveandOTStatus status;
    private LocalDateTime createdDateOT;
    private LocalDateTime approvedDateOT;
    private String note;
}
