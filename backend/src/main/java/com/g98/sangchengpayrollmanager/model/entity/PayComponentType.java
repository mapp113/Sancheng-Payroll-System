package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pay_component_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayComponentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(length = 200, nullable = false)
    private String description;

    @Column(name = "is_fixed", nullable = false)
    private Boolean isFixed;

    @Column(name = "is_taxed", nullable = false)
    private Boolean isTaxed;

    @Column(name = "is_insured", nullable = false)
    private Boolean isInsured;
}

