package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "leave_quota",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_code", "leave_type_code", "year"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "employee_code", nullable = false, length = 50)
    private String employeeCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_code", referencedColumnName = "employee_code", insertable = false, updatable = false)
    private User user;

    @Column(name = "leave_type_code", nullable = false, length = 50)
    private String leaveTypeCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_code", referencedColumnName = "code", insertable = false, updatable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "entitled_days")
    private Double entitledDays;

    @Column(name = "carried_over", nullable = false)
    private Double carriedOver ;

    @Column(name = "used_days", nullable = false)
    private Double usedDays  ;

    @Transient
    public Double getRemainingDays() {
        if (entitledDays == null) return null;
        return entitledDays + carriedOver - usedDays;
    }
}
