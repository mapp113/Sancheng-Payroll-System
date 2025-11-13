package com.g98.sangchengpayrollmanager.scheduler;

import com.g98.sangchengpayrollmanager.service.AttendanceSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AttendanceSyncScheduler {
    private final AttendanceSyncService syncService;

    /**
     * SYNC KHI APP KHỞI ĐỘNG
     */
    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        log.info("🚀 Application started - syncing attendance data");
        syncService.syncAll();
    }

    /**
     * SYNC TỰ ĐỘNG MỖI 5 PHÚT
     */
    @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 ms
    public void scheduledSync() {
        log.debug("⏰ 5-minute sync triggered");
        syncService.syncIncremental();
    }

    /**
     * FULL SYNC VÀO 23:55 MỖI NGÀY
     */
    @Scheduled(cron = "0 55 23 * * ?")
    public void endOfDayFullSync() {
        log.info("🌙 End-of-day full sync");
        syncService.syncAll();
    }
}