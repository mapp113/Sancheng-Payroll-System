package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

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
    @Column(name = "`from`", length = 10, nullable = false)
    private String fromValue;

    @Column(name = "to", nullable = false)
    private Integer toValue;

    @Column(precision = 3, scale = 2, nullable = false)
    private BigDecimal percentage;
}

