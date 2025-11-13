package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.UserDTO;
import com.g98.sangchengpayrollmanager.model.entity.User;

public class UserMapper {

    public static UserDTO toDTO(User user) {
        return new UserDTO(
                user.getUserId(),
                user.getEmployeeCode(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getDob(),
                user.getPhoneNo(),
                user.getStatus(),
                user.getRole() != null ? user.getRole().getId() : null,
                user.getRole() != null ? user.getRole().getName() : null
        );
    }
}

