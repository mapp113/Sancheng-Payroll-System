package com.g98.sangchengpayrollmanager.model.entity;


import jakarta.persistence.*;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "employee_code", length = 50, nullable = false)
    private String employeeCode;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(length = 50, nullable = false, unique = true)
    private String username;

    @Column(length = 500, nullable = false)
    private String password;

    @Column(length = 100, nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private LocalDate dob;

    @Column(name = "phone_no", length = 11, nullable = false)
    private String phoneNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_role"))
    private Role role;

    // 1 = Hoạt động, 0 = Tạm khóa
    @Column(name = "status", nullable = false)
    private Integer status;

    @Column(name = "user_id")
    private String userId;


}

