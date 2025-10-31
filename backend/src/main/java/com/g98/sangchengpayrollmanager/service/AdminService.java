package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.CreateAccountRequest;
import com.g98.sangchengpayrollmanager.model.dto.RoleSummaryDTO;
import com.g98.sangchengpayrollmanager.model.dto.UpdateUserRequest;
import com.g98.sangchengpayrollmanager.model.dto.UserDTO;
import com.g98.sangchengpayrollmanager.model.dto.api.response.ApiResponse;
import com.g98.sangchengpayrollmanager.model.entity.Role;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.AdminRepository;
import com.g98.sangchengpayrollmanager.repository.RoleCountProjection;
import com.g98.sangchengpayrollmanager.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<RoleSummaryDTO> getRoleSummary() {
        List<RoleCountProjection> rows = adminRepository.countUsersGroupByRole();

        Map<Long, String> roleNameMap = Map.of(
                1L, "Admin",
                2L, "HR",
                3L, "Employee",
                4L, "Manager",
                5L, "Accountant"
        );

        return rows.stream()
                .map(r -> new RoleSummaryDTO(roleNameMap.get(r.getRoleId()), r.getTotal()))
                .toList();
    }

    public List<UserDTO> getAllUsers() {
        return adminRepository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .toList();
    }

    public ApiResponse<?> createAccount(CreateAccountRequest req) {

        // 0. check trùng employee_code (PK)
        if (adminRepository.existsById(req.getEmployeeCode())) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Mã nhân viên đã tồn tại")
                    .build();
        }

        // 1. check trùng username
        if (adminRepository.existsByUsername(req.getUsername())) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Username đã tồn tại")
                    .build();
        }

        // 2. check trùng email
        if (adminRepository.existsByEmail(req.getEmail())) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Email đã tồn tại")
                    .build();
        }

        // 3. lấy role
        var role = roleRepository.findById(req.getRoleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role id = " + req.getRoleId()));

        // 4. build user
        var user = User.builder()
                .employeeCode(req.getEmployeeCode())
                .fullName(req.getFullName())
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .email(req.getEmail())
                .dob(req.getDob() != null && !req.getDob().isBlank()
                        ? java.time.LocalDate.parse(req.getDob())
                        : java.time.LocalDate.of(2000, 1, 1))
                .phoneNo(req.getPhoneNo())
                .role(role)
                .status(req.getStatus() != null ? req.getStatus() : 1)
                .build();

        adminRepository.save(user);

        return ApiResponse.builder()
                .status(200)
                .message("Tạo tài khoản thành công")
                .data(UserMapper.toDTO(user))
                .build();
    }

    public ApiResponse<?> updateUser(String employeeCode, UpdateUserRequest req) {
        // 1. tìm user
        User user = adminRepository.findById(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với mã: " + employeeCode));

        // 2. cập nhật các field được phép sửa
        if (req.getFullName() != null) {
            user.setFullName(req.getFullName());
        }

        if (req.getEmail() != null) {
            // check trùng email (trừ chính nó)
            boolean emailExists = adminRepository.existsByEmail(req.getEmail())
                    && !req.getEmail().equalsIgnoreCase(user.getEmail());
            if (emailExists) {
                return ApiResponse.builder()
                        .status(400)
                        .message("Email đã được sử dụng")
                        .build();
            }
            user.setEmail(req.getEmail());
        }

        if (req.getPhoneNo() != null) {
            user.setPhoneNo(req.getPhoneNo());
        }

        if (req.getStatus() != null) {
            user.setStatus(req.getStatus());
        }

        if (req.getRoleId() != null) {
            Role role = roleRepository.findById(req.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy role id = " + req.getRoleId()));
            user.setRole(role);
        }

        adminRepository.save(user);

        return ApiResponse.builder()
                .status(200)
                .message("Cập nhật tài khoản thành công")
                .data(UserMapper.toDTO(user))
                .build();
    }


}

