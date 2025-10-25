package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "att_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 50, nullable = false)
    private String status;

    @Column(name = "worked_hour")
    private Integer workedHour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "check_in_recordID")
    private AttRecord checkInRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "check_out_recordID")
    private AttRecord checkOutRecord;
}

