package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "salary_infomation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "employee_code",
            referencedColumnName = "employee_code",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_salary_user")
    )
    private User user;

    @Column(name = "base_salary", nullable = false)
    private Integer baseSalary;

    @Column(name = "base_hourly_rate", nullable = false)
    private Integer baseHourlyRate;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "status", length = 10)
    private String status;
}