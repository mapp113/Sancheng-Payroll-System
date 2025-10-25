package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "pay_summary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "salary_id",
            referencedColumnName = "id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_pay_summary_salary_infomation")
    )
    private SalaryInformation salaryInformation;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "gross_income", nullable = false)
    private Integer grossIncome;

    @Column(name = "assessable_income", nullable = false)
    private Integer assessableIncome;

    @Column(name = "taxable_income", length = 10, nullable = false)
    private Integer taxableIncome;

    @Column(name = "tax_amount", nullable = false)
    private Integer taxAmount;

    @Column(name = "bh_amount", nullable = false)
    private Integer bhAmount;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "ot_hour", nullable = false)
    private Integer otHour;

    @Column(name = "ot_amount", nullable = false)
    private Integer otAmount;

    @Column(name = "net_salary", nullable = false)
    private Integer netSalary;

    @Column(name = "payslip_url", length = 100)
    private String payslipUrl;
}
