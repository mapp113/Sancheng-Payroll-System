package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "insurance_policy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsurancePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(name = "employee_percentage", precision = 5, scale = 3, nullable = false)
    private BigDecimal employeePercentage;

    @Column(name = "max_amount", nullable = false)
    private Integer maxAmount;

    @Column(name = "company_percentage", precision = 5, scale = 3, nullable = false)
    private BigDecimal companyPercentage;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Transient
    public boolean isActive() {
        LocalDate today = LocalDate.now();
        return (effectiveFrom.isBefore(today) || effectiveFrom.isEqual(today)) &&
                (effectiveTo == null || !effectiveTo.isBefore(today));
    }
}

