package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.PaySummaryStatus;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayrollNotificationService {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy");

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PaySummaryService paySummaryService;

    @Value("${app.payroll-notification.mail.from:${spring.mail.username}}")
    private String defaultFromAddress;

    @Value("${app.payroll-notification.mail.enabled:true}")
    private boolean mailEnabled;

    public void sendMonthlyPayrollNotifications(LocalDate referenceDate) {
        YearMonth payrollMonth = YearMonth.from(referenceDate.minusMonths(1));
        List<User> activeUsers = userRepository.findByStatus(1);

        for (User user : activeUsers) {
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                log.warn("Bỏ qua gửi thông báo lương cho {} vì thiếu email", user.getEmployeeCode());
                continue;
            }
            paySummaryService.updatePaySummaryStatus(user.getEmployeeCode(), payrollMonth, PaySummaryStatus.APPROVED.toString());
            sendNotification(user, payrollMonth);
        }
    }

    private void sendNotification(User user, YearMonth payrollMonth) {
        String formattedMonth = payrollMonth.format(MONTH_FORMATTER);
        String subject = "Thông báo lương tháng " + formattedMonth;
        String body = String.format(
                "Xin chào %s,%n%nLương tháng %s đã được cập nhật trên hệ thống. " +
                        "Vui lòng đăng nhập vào website để kiểm tra chi tiết và xác nhận thông tin.%n%n" +
                        "Trân trọng,%nSangcheng Payroll Manager",
                user.getFullName(),
                formattedMonth
        );

        if (!mailEnabled) {
            log.info("[PAYROLL NOTIFICATION DISABLED] Would send payroll email to {} ({}) for tháng {}",
                    user.getEmail(),
                    user.getEmployeeCode(),
                    formattedMonth);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject(subject);
        message.setText(body);
        if (defaultFromAddress != null && !defaultFromAddress.isBlank()) {
            message.setFrom(defaultFromAddress);
        }

        try {
            mailSender.send(message);
            log.info("Đã gửi thông báo lương tháng {} tới {} ({})", formattedMonth, user.getEmail(), user.getEmployeeCode());
        } catch (MailException exception) {
            log.error("Không thể gửi email thông báo lương tới {} ({})", user.getEmail(), user.getEmployeeCode(), exception);
        }
    }
}