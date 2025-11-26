// com.g98.sangchengpayrollmanager.service.AdminService
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

import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final BiometricSyncService biometricSyncService;

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0\\d{9,10}$");

    public List<RoleSummaryDTO> getRoleSummary() {
        List<RoleCountProjection> rows = adminRepository.countUsersGroupByRole();
        Map<Long, String> roleNameMap = Map.of(
                1L, "Admin", 2L, "HR", 3L, "Employee", 4L, "Manager", 5L, "Accountant"
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

    public List<UserDTO> getAllEmployees() {
        return adminRepository.findAll()
                .stream()
                .filter(user -> user.getRole() != null &&
                        "EMPLOYEE".equalsIgnoreCase(user.getRole().getName()))
                .map(UserMapper::toDTO)
                .toList();
    }


    private boolean portOpen(String host, int port, int timeoutMs) {
        try (Socket s = new Socket()) {
            s.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public ApiResponse<?> createAccount(CreateAccountRequest req) {
        String username = normalize(req.getUsername());
        String email = normalize(req.getEmail());
        String phoneNo = normalize(req.getPhoneNo());
        String userId = normalize(req.getUserId()); // NEW

        // -1. Validate dữ liệu đầu vào
        if (userId == null || userId.isBlank()) {
            return ApiResponse.builder().status(400).message("userId không được trống").build();
        }
        if (!hasMinimumLength(username, 6)) {
            return ApiResponse.builder().status(400).message("Username phải có ít nhất 6 ký tự").build();
        }
        if (!isValidEmail(email)) {
            return ApiResponse.builder().status(400).message("Email không hợp lệ").build();
        }
        if (!isValidPhone(phoneNo)) {
            return ApiResponse.builder().status(400).message("Số điện thoại không hợp lệ").build();
        }

        // 0. Check trùng employee_code (PK)
        if (adminRepository.existsById(req.getEmployeeCode())) {
            return ApiResponse.builder().status(400).message("Mã nhân viên đã tồn tại").build();
        }
        // 0.1 Check trùng userId (máy chấm công)
        if (adminRepository.existsByUserId(userId)) {
            return ApiResponse.builder().status(400).message("UserID đã tồn tại").build();
        }
        // 1. Check trùng username
        if (adminRepository.existsByUsername(username)) {
            return ApiResponse.builder().status(400).message("Username đã tồn tại").build();
        }
        // 2. Check trùng email
        if (adminRepository.existsByEmail(email)) {
            return ApiResponse.builder().status(400).message("Email đã tồn tại").build();
        }

        Role role = roleRepository.findById(req.getRoleId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role id = " + req.getRoleId()));

        LocalDate dob = LocalDate.of(2000, 1, 1);
        if (req.getDob() != null && !req.getDob().isBlank()) {
            try {
                dob = LocalDate.parse(req.getDob().trim());
            } catch (DateTimeParseException e) {
                return ApiResponse.builder().status(400).message("Định dạng ngày sinh không hợp lệ (yyyy-MM-dd)").build();
            }
        }

        User user = User.builder()
                .employeeCode(req.getEmployeeCode())
                .userId(userId) // NEW
                .fullName(req.getFullName())
                .username(username)
                .password(passwordEncoder.encode(req.getPassword()))
                .email(email)
                .dob(dob)
                .phoneNo(phoneNo)
                .role(role)
                .status(req.getStatus() != null ? req.getStatus() : 1)
                .build();

        boolean isAdmin = req.getRoleId() != null && req.getRoleId() == 1L;
        String devicePin = req.getDevicePin() != null ? req.getDevicePin().trim() : "";
        String ip = "192.168.0.2";

        // Pre-check TCP để fail nhanh khi máy offline (2s)
        if (!portOpen(ip, 4370, 2000)) {
            return ApiResponse.builder().status(502).message("Thiết bị offline (port 4370 không mở)").build();
        }

        // Push user với timeout 30s (dùng userId)
        boolean pushed = biometricSyncService.pushUserBlocking(
                user.getUserId(),
                user.getFullName(),
                devicePin,
                isAdmin,
                30000
        );

        if (!pushed) {
            return ApiResponse.builder().status(502).message("Không thể đồng bộ với thiết bị (timeout hoặc lỗi)").build();
        }

        // Lưu user vào DB
        adminRepository.save(user);

        return ApiResponse.builder()
                .status(200)
                .message("Tạo tài khoản thành công & đã đồng bộ máy chấm công")
                .data(UserMapper.toDTO(user))
                .build();
    }

    public ApiResponse<?> updateUser(String employeeCode, UpdateUserRequest req) {
        // 1. tìm user
        User user = adminRepository.findById(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với mã: " + employeeCode));

        // 2. cập nhật các field được phép sửa (KHÔNG đổi userId ở đây)
        if (req.getFullName() != null) {
            user.setFullName(req.getFullName());
        }

        if (req.getEmail() != null) {
            String newEmail = normalize(req.getEmail());
            if (!isValidEmail(newEmail)) {
                return ApiResponse.builder().status(400).message("Email không hợp lệ").build();
            }
            boolean emailExists = adminRepository.existsByEmail(newEmail) && !newEmail.equalsIgnoreCase(user.getEmail());
            if (emailExists) {
                return ApiResponse.builder().status(400).message("Email đã được sử dụng").build();
            }
            user.setEmail(newEmail);
        }

        if (req.getPhoneNo() != null) {
            String newPhoneNo = normalize(req.getPhoneNo());
            if (!isValidPhone(newPhoneNo)) {
                return ApiResponse.builder().status(400).message("Số điện thoại không hợp lệ").build();
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
