package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.math.BigDecimal;

@Entity
@Table(name = "att_month_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttMonthSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private LocalDate month;

    @Column(name = "day_standard", precision = 10, scale = 2, nullable = false)
    private BigDecimal dayStandard;

    @Column(name = "days_meal", precision = 10, scale = 2, nullable = false)
    private BigDecimal daysMeal;

    @Column(name = "days_trial", precision = 10, scale = 2, nullable = false)
    private BigDecimal daysTrial;

    @Column(name = "days_payable", precision = 10, scale = 2, nullable = false)
    private BigDecimal daysPayable;

    @Column(name = "ot_hours",nullable = false)
    private Integer otHours;

    @Column(name = "days_hours", nullable = false)
    private Integer daysHours;

    @Column(name = "used_leave",nullable = false)
    private Integer usedleave;

    @Column(name = "standard_hours_per_day", precision = 4, scale = 2, nullable = false)
    private BigDecimal standardHoursPerDay;
}

