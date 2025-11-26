package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.entity.Notification;
import com.g98.sangchengpayrollmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications() {
        return notificationService.getMyLatestNotifications();
    }

    @GetMapping("/unread-count")
    public Long getUnreadCount() {
        return notificationService.getUnreadNotificationsCount();
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
    }

}
