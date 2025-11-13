package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column(nullable = false, unique = true)
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

    @Column(name = "is_count_payable_day")
    private Boolean isCountPayableDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_type_id")
    private DayType dayType;

    @Column(name = "check_in_time", nullable = false)
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;
}

