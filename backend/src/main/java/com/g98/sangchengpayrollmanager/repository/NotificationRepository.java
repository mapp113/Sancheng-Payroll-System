package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findTop10ByUserEmployeeCodeOrderByCreatedAtDesc(String employeeCode);

    long countByUserEmployeeCodeAndIsReadFalse(String employeeCode);

}
