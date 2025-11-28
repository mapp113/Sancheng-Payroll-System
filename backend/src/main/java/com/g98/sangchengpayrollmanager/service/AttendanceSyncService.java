package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.device.AttendanceLog;
import com.g98.sangchengpayrollmanager.device.ZKTecoClient;
import com.g98.sangchengpayrollmanager.model.entity.AttRecord;
import com.g98.sangchengpayrollmanager.repository.AttRecordRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final UserRepository userRepository;

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

                // ✅ FIX: Thêm employeeCode như syncIncremental
                AttRecord record = AttRecord.builder()
                        .userId(log.getUserId())
                        .checkTime(log.getCheckTime())
                        .attDeviceId(1)
                        .employeeCode(userRepository.findEmployeeCodeByUserId(log.getUserId()))
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

    @Transactional
    public void syncIncremental() {
        try {
            log.info("🔄 Starting incremental attendance sync...");

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

                // Save new record to db
                AttRecord record = AttRecord.builder()
                        .userId(log.getUserId())
                        .checkTime(log.getCheckTime())
                        .attDeviceId(1)
                        .employeeCode(userRepository.findEmployeeCodeByUserId(log.getUserId()))
                        .build();

                recordRepo.save(record);
                saved++;
            }

            log.info("✅ Incremental sync completed: {} saved, {} skipped, {} total",
                    saved, skipped, logs.size());

        } catch (Exception e) {
            log.error("❌ Incremental sync failed: {}", e.getMessage(), e);
            throw e; // Re-throw để rollback transaction
        }
    }
}