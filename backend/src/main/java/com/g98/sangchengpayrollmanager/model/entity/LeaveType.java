package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "leave_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, nullable = false, unique = true)
    private String code;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid;

    @Column(name = "is_counted_as_leave", nullable = false)
    private Boolean isCountedAsLeave;

    @Column(name = "standard_days_per_year", precision = 5, scale = 2)
    private BigDecimal standardDaysPerYear;

    @Column(length = 255)
    private String note;
}

