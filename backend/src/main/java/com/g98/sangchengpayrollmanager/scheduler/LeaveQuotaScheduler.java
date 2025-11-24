package com.g98.sangchengpayrollmanager.scheduler;

import com.g98.sangchengpayrollmanager.service.LeaveQuotaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveQuotaScheduler {

    private final LeaveQuotaService leaveQuotaService;

    /**
     * Tạo leave quota cho NĂM MỚI cho toàn bộ nhân viên theo leaveType.
     *
     * Cron format: second minute hour day-of-month month day-of-week
     * "0 5 0 1 1 ?" = 00:05:00 ngày 01/01 hằng năm
     */
    @Scheduled(cron = "0 5 0 1 1 ?")
    public void initLeaveQuotaForNewYear() {
        int year = LocalDate.now().getYear(); // sang năm mới thì year chính là năm mới

        log.info("Start init leave quota for year {}", year);

        try {
            // Hàm này bạn tự implement trong LeaveQuotaService
            // Logic: tạo quota cho TẤT CẢ nhân viên + TẤT CẢ leaveType
            // và chỉ tạo những bản ghi chưa tồn tại
            leaveQuotaService.initLeaveQuotaForYear(year);
        } catch (Exception ex) {
            log.error("Error init leave quota for year {}", year, ex);
        }

        log.info("Finish init leave quota for year {}", year);
    }
}
