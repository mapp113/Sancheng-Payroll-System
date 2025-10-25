package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "att_daily_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttDailySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "work_hours", nullable = false)
    private Integer workHours;

    @Column(name = "ot_hour")
    private Integer otHour;

    @Column(name = "is_day_meal")
    private Boolean isDayMeal;

    @Column(name = "is_trial_day")
    private Boolean isTrialDay;

    @Column(name = "is_payable_day")
    private Boolean isPayableDay;
}

