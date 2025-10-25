package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.math.BigDecimal;

@Entity
@Table(name = "shift")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50)
    private String name;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_type_id")
    private DayType dayType;

    @Column(name = "is_night_shift", length = 10)
    private String isNightShift;

    @Column(precision = 3, scale = 2)
    private BigDecimal rate;

    @Column(name = "is_ot")
    private Boolean isOt;
}

