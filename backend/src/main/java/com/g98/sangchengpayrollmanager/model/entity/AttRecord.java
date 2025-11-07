package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "att_record")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "att_device_id")
    private Integer attDeviceId; // Nullable - để null cho single device

    @Column(name = "user_id")
    private String userId; // employee_code từ user table

    @Column(name = "check_time", nullable = false)
    private LocalDateTime checkTime;

    @Column(name = "date")
    private java.time.LocalDate date; // Tách ngày để query dễ hơn

    @PrePersist
    protected void onCreate() {
        if (date == null && checkTime != null) {
            date = checkTime.toLocalDate();
        }
    }
}