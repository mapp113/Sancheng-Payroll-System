package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "day_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50)
    private String name;

    @Column(length = 100)
    private String description;
}

