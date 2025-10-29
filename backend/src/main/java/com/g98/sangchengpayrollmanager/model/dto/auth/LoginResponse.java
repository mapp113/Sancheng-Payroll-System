package com.g98.sangchengpayrollmanager.model.dto.auth;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private String message;
    private String token;

}
