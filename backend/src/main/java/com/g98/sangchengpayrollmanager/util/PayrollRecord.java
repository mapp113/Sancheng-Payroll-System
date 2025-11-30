package com.g98.sangchengpayrollmanager.util;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter@Setter
public class PayrollRecord  {
    private String customerName;   // Tên KH thụ hưởng
    private String description;    // Mô tả
    private Integer amount;           // Số tiền
    private String bankAccount;    // Tài khoản thụ hưởng;
}
