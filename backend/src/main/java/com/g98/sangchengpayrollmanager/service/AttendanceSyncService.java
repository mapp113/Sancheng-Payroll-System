package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.device.AttendanceLog;
import com.g98.sangchengpayrollmanager.device.ZKTecoClient;
import com.g98.sangchengpayrollmanager.model.entity.AttRecord;
import com.g98.sangchengpayrollmanager.repository.AttRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceSyncService {
    private final ZKTecoClient zkClient;
    private final AttRecordRepository recordRepo;

    /**
     * ĐỒNG BỘ TOÀN BỘ - Lấy tất cả logs
     */
    @Transactional
    public void syncAll() {
        try {
            log.info("🔄 Starting full attendance sync...");

            List<AttendanceLog> logs = zkClient.readAllLogs();

            if (logs.isEmpty()) {
                log.info("ℹ️ No attendance logs found");
                return;
            }

            int saved = 0;
            int skipped = 0;

            for (AttendanceLog log : logs) {
                // Skip if already exists
                if (recordRepo.existsByUserIdAndCheckTime(log.getUserId(), log.getCheckTime())) {
                    skipped++;
                    continue;
                }

                // Save new record
                AttRecord record = AttRecord.builder()
                        .userId(log.getUserId())
                        .checkTime(log.getCheckTime())
                        .attDeviceId(1) // Single device - no device FK
                        .build();

                recordRepo.save(record);
                saved++;
            }

            log.info("✅ Full sync completed: {} saved, {} skipped, {} total",
                    saved, skipped, logs.size());

        } catch (Exception e) {
            log.error("❌ Full sync failed: {}", e.getMessage(), e);
        }
    }

    /**
     * ĐỒNG BỘ INCREMENTAL - Chỉ lấy records mới hơn lastSync
     */
    @Transactional
    public void syncIncremental() {
        try {
            LocalDateTime lastSync = recordRepo.findLatestCheckTime();

            if (lastSync != null) {
                log.debug("🔄 Syncing records after: {}", lastSync);
            } else {
                log.info("🔄 First sync - getting all records");
            }

            List<AttendanceLog> logs = zkClient.readAllLogs();

            if (logs.isEmpty()) {
                log.debug("ℹ️ No new attendance logs");
                return;
            }

            int saved = 0;

            for (AttendanceLog log : logs) {
                // Skip if older than last sync
                if (lastSync != null && !log.getCheckTime().isAfter(lastSync)) {
                    continue;
                }

                // Skip if already exists
                if (recordRepo.existsByUserIdAndCheckTime(log.getUserId(), log.getCheckTime())) {
                    continue;
                }

                // Save new record
                AttRecord record = AttRecord.builder()
                        .userId(log.getUserId())
                        .checkTime(log.getCheckTime())
                        .attDeviceId(1)
                        .build();

                recordRepo.save(record);
                saved++;
            }

            if (saved > 0) {
                log.info("✅ Incremental sync: {} new records saved", saved);
            } else {
                log.debug("ℹ️ No new records to save");
            }

        } catch (Exception e) {
            log.error("❌ Incremental sync failed: {}", e.getMessage(), e);
        }
    }
}

