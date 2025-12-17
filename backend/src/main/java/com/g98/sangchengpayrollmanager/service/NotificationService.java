package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.entity.Notification;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.NotificationRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(String receiverCode,
                                   String title,
                                   String message,
                                   String type,
                                   Integer refId) {

        User user = userRepository.findByEmployeeCode(receiverCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(refId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

    }

    public List<Notification> getMyLatestNotifications() {
        String employeeCode = getCurrentUsername();
        return notificationRepository.findTop10ByUserEmployeeCodeOrderByCreatedAtDesc(employeeCode);

    }

    public long getUnreadNotificationsCount() {
        String employeeCode = getCurrentUsername();
        return notificationRepository.countByUserEmployeeCodeAndIsReadFalse(employeeCode);
    }

    @Transactional
    public void markAsRead(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không có thông bao nào"));
        notification.setIsRead(true);
    }

    private String getCurrentUsername() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại "))
                .getEmployeeCode();
    }
}
