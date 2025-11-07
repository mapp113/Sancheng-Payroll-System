package com.g98.sangchengpayrollmanager.device;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLog {
    private String userId;
    private LocalDateTime checkTime;
}