package com.g98.sangchengpayrollmanager.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employee_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "employee_code",
            referencedColumnName = "employee_code",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_employee_infomation_user")
    )
    private User user;

    @Column(name = "tax_no", length = 50)
    private String taxNo;

    @Column(name = "social_no", length = 50, nullable = false)
    private String socialNo;

    @Column(name = "bank_number", length = 50)
    private String bankNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "position_id",
            referencedColumnName = "id",
            foreignKey = @ForeignKey(name = "fk_employee_infomation_position")
    )
    private Position position;

    @Column(name = "dependents_no")
    private Integer dependentsNo;
}
