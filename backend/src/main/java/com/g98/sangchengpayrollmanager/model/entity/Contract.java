package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "contract")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {

    @Id
    @Column(name = "contract_code", length = 50, nullable = false)
    private String contractCode;

    @Column(length = 50)
    private String type;

    @Column(length = 50, nullable = false)
    private String status;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "probation_income_amount")
    private Integer probationIncomeAmount;

    @Column(name = "base_salary")
    private Integer baseSalary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code")
    private User user;

    @Column(name = "pdf_path", length = 100)
    private String pdfPath;
}

