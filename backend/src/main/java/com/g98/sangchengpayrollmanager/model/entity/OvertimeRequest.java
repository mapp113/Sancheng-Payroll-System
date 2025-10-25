package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "overtime_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OvertimeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "from_time")
    private LocalDateTime fromTime;

    @Column(name = "to_time")
    private LocalDateTime toTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code")
    private User user;

    @Column(length = 10)
    private String status;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "worked_time")
    private Integer workedTime;
}

