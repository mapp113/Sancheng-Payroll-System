package com.g98.sangchengpayrollmanager.scheduler;

import com.g98.sangchengpayrollmanager.service.AttendanceReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceReminderScheduler {

    private final AttendanceReminderService attendanceReminderService;

    @Scheduled(cron = "${app.attendance-reminder.cron:0 30 09 * * ?}")
    public void sendMiddayReminders() {
        LocalDate today = LocalDate.now();
        log.info("Chạy job nhắc nhở chấm công buổi trưa cho ngày {}", today);
        attendanceReminderService.sendMissingCheckInReminders(today);
    }
}