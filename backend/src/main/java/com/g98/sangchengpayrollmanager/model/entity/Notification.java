package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code", referencedColumnName = "employee_code")
    private User user;

    private String title;
    private String message;

    private String type;          // SALARY, OT_REQUEST, LEAVE_REQUEST, APPROVED...

    private Integer referenceId;

    private Boolean isRead;

    private LocalDateTime createdAt;
}
