package com.g98.sangchengpayrollmanager.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAccountRequest {
    private String userId;

    private String employeeCode;

    private String fullName;

    private String username;

    private String password;

    private String email;

    // yyyy-MM-dd
    private String dob; // cho FE gửi string, mình parse sau

    private String phoneNo;

    private Long roleId; // map sang bảng hrm.role

    private String devicePin;

    // 1 = hoạt động, 0 = tạm khóa
    @Builder.Default
    private Integer status = 1;
}

