package com.g98.sangchengpayrollmanager.model.entity;

import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;


    @Column(name = "from_date", nullable = false)
    private LocalDate fromDate;

    @Column(name = "to_date")
    private LocalDate toDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "duration_type", nullable = false, length = 20)
    private DurationType durationType;


    @Column(length = 500)
    private String reason;

    @Column(name = "status")
    private String status;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "is_paid_leave", nullable = false)
    private Boolean isPaidLeave = Boolean.TRUE;

}

