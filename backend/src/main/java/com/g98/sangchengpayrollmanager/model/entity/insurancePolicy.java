package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

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

    @Column(name = "employee_percentage", precision = 3, scale = 2, nullable = false)
    private BigDecimal employeePercentage;

    @Column(name = "max_amount", nullable = false)
    private Integer maxAmount;

    @Column(name = "company_percentage", precision = 3, scale = 2, nullable = false)
    private BigDecimal companyPercentage;
}

