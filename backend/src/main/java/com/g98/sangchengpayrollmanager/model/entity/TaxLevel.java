package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tax_level")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, nullable = false)
    private String name;

    // 'from' là từ khóa SQL nên phải đặt tên cột bằng backtick
    @Column(name = "`from`", nullable = false)
    private Integer fromValue;

    @Column(name = "`to`", nullable = false)
    private Integer toValue;

    @Column(precision = 5, scale = 3, nullable = false)
    private BigDecimal percentage;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;
}

