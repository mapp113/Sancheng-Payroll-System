package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "overtime_balance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OvertimeBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code", nullable = false)
    private User user;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "month", nullable = false)
    private Integer month;

    @Column(name = "hour_balance")
    private Integer hourBalance;
}
