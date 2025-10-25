package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "att_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "att_device_id", nullable = false)
    private AttDevice device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code", nullable = false)
    private User user;

    @Column(name = "check_time", nullable = false)
    private LocalDateTime checkTime;
}

