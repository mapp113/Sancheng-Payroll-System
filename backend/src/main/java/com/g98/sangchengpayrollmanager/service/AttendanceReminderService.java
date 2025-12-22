package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.AttRecordRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveRequestRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceReminderService {

    private final AttRecordRepository attRecordRepository;
    private final UserRepository userRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final JavaMailSender mailSender;

    @Value("${app.attendance-reminder.mail.from:${spring.mail.username}}")
    private String defaultFromAddress;

    @Value("${app.attendance-reminder.mail.enabled:true}")
    private boolean mailEnabled;

    public void sendMissingCheckInReminders(LocalDate date) {
        List<User> activeUsers = userRepository.findByStatus(1);
        for (User user : activeUsers) {
            if (user.getUserId() == null || user.getUserId().isBlank()) {
                log.warn("Bỏ qua gửi nhắc nhở cho {} vì thiếu mã userId", user.getEmployeeCode());
                continue;
            }

            boolean hasRecord = attRecordRepository.existsByUserIdAndDate(user.getUserId(), date);
            if (hasRecord) {
                continue;
            }

            boolean isOnApprovedLeave = leaveRequestRepository
                    .findByUserAndDateAndStatus(user, date, LeaveandOTStatus.APPROVED.name())
                    .isPresent();

            if (isOnApprovedLeave) {
                log.info("Bỏ qua gửi nhắc nhở cho {} ({}) do đang nghỉ có phép", user.getEmployeeCode(), user.getFullName());
                continue;
            }

            sendReminder(user, date);
        }
    }

    private void sendReminder(User user, LocalDate date) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            log.warn("Không thể gửi nhắc nhở cho {} vì thiếu email", user.getEmployeeCode());
            return;
        }

        String body = String.format(
                "Xin chào %s,%n%nHệ thống chưa ghi nhận chấm công của bạn trong ngày %s trước 9h30 sáng." +
                        " Vui lòng kiểm tra lại và thực hiện chấm công hoặc liên hệ bộ phận nhân sự nếu có vướng mắc.%n%n" +
                        "Trân trọng,%nSangcheng Payroll Manager",
                user.getFullName(),
                date
        );

        if (!mailEnabled) {
            log.info("[ATTENDANCE REMINDER DISABLED] Would send reminder to {} ({}) for date {}", user.getEmail(), user.getEmployeeCode(), date);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Nhắc nhở chấm công buổi trưa");
        message.setText(body);
        if (defaultFromAddress != null && !defaultFromAddress.isBlank()) {
            message.setFrom(defaultFromAddress);
        }

        try {
            mailSender.send(message);
            log.info("Đã gửi email nhắc nhở chấm công cho {} ({})", user.getEmail(), user.getEmployeeCode());
        } catch (MailException exception) {
            log.error("Không thể gửi email nhắc nhở chấm công tới {}", user.getEmail(), exception);
        }
    }
}