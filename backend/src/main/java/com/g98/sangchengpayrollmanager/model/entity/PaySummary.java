package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

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

    @Column(name = "taxable_income", nullable = false)
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

    @Column(name = "payslip_url", length = 500)
    private String payslipUrl;

    @Column(name = "base_salary_amt", nullable = false)
    private Integer baseSalaryAmt;

    @Column(name = "other_deduction")
    private Integer otherDeduction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "employee_code",
            referencedColumnName = "employee_code",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_pay_summary_user")
    )
    private User user;

    @OneToMany(
            mappedBy = "paySummary",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<PaySummaryComponent> components = new ArrayList<>();
}
