package com.g98.sangchengpayrollmanager.model.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {

    // ID trong bảng = employee_code
    private String employeeCode;

    private String fullName;

    private String email;

    private String phoneNo;

    // 1 = hoạt động, 0 = tạm khóa
    private Integer status;

    // đổi role
    private Long roleId;
}
