package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "att_device")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = 50)
    private String vendor;

    @Column(length = 50)
    private String model;

    @Column(length = 50)
    private String serial;
}

