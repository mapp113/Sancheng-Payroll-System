package com.g98.sangchengpayrollmanager.scheduler;

import com.g98.sangchengpayrollmanager.service.PayrollNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;

@Slf4j
@Component
@RequiredArgsConstructor
public class PayrollNotificationScheduler {

    private final PayrollNotificationService payrollNotificationService;

    @Scheduled(cron = "${app.payroll-notification.cron:0 05 23 * * ?}")
    public void sendMonthlyPayrollReminder() {
        LocalDate today = LocalDate.now();
        YearMonth payrollMonth = YearMonth.from(today.minusMonths(1));
        log.info("Chạy job thông báo lương tháng {} vào {}", payrollMonth, today);
        payrollNotificationService.sendMonthlyPayrollNotifications(today);
    }
}