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
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{9,10}$");

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
        String username = normalize(req.getUsername());
        String email = normalize(req.getEmail());
        String phoneNo = normalize(req.getPhoneNo());

        // -1. validate dữ liệu đầu vào
        if (!hasMinimumLength(username, 6)) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Username phải có ít nhất 6 ký tự")
                    .build();
        }

        if (!isValidEmail(email)) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Email không hợp lệ")
                    .build();
        }

        if (!isValidPhone(phoneNo)) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Số điện thoại không hợp lệ")
                    .build();
        }

        // 0. check trùng employee_code (PK)
        if (adminRepository.existsById(req.getEmployeeCode())) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Mã nhân viên đã tồn tại")
                    .build();
        }

        // 1. check trùng username

        if (adminRepository.existsByUsername(username)) {
            return ApiResponse.builder()
                    .status(400)
                    .message("Username đã tồn tại")
                    .build();
        }

        // 2. check trùng email

        if (adminRepository.existsByEmail(email)) {
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

                .username(username)
                .password(passwordEncoder.encode(req.getPassword()))

                .email(email)
                .dob(req.getDob() != null && !req.getDob().isBlank()

                        ? java.time.LocalDate.parse(req.getDob().trim())
                        : java.time.LocalDate.of(2000, 1, 1))

                .phoneNo(phoneNo)
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
            String newEmail = normalize(req.getEmail());
            if (!isValidEmail(newEmail)) {
                return ApiResponse.builder()
                        .status(400)
                        .message("Email không hợp lệ")
                        .build();
            }
            // check trùng email (trừ chính nó)

            boolean emailExists = adminRepository.existsByEmail(newEmail)
                    && !newEmail.equalsIgnoreCase(user.getEmail());
            if (emailExists) {
                return ApiResponse.builder()
                        .status(400)
                        .message("Email đã được sử dụng")
                        .build();
            }

            user.setEmail(newEmail);
        }

        if (req.getPhoneNo() != null) {
          
            String newPhoneNo = normalize(req.getPhoneNo());
            if (!isValidPhone(newPhoneNo)) {
                return ApiResponse.builder()
                        .status(400)
                        .message("Số điện thoại không hợp lệ")
                        .build();
            }
            user.setPhoneNo(newPhoneNo);
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

    private boolean hasMinimumLength(String value, int length) {
        return value != null && value.length() >= length;
    }

    private boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    private boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    private String normalize(String value) {
        return value != null ? value.trim() : null;
    }

}
