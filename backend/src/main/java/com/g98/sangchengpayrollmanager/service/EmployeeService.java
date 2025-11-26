package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeInfoResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileResponse;
import com.g98.sangchengpayrollmanager.model.dto.employee.EmployeeProfileUpdateRequest;
import com.g98.sangchengpayrollmanager.model.entity.Contract;
import com.g98.sangchengpayrollmanager.model.entity.EmployeeInformation;
import com.g98.sangchengpayrollmanager.model.entity.Position;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.ContractRepository;
import com.g98.sangchengpayrollmanager.repository.EmployeeInformationRepository;
import com.g98.sangchengpayrollmanager.repository.PositionRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeInformationRepository repo;
    private final ContractRepository contractRepository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;

    public EmployeeInfoResponse getByEmployeeCode(String employeeCode) {
        EmployeeInformation info = repo.findByEmployeeCodeFetchAll(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có mã: " + employeeCode));
        return EmployeeInfoResponse.fromEntity(info);
    }

    @Transactional(readOnly = true)
    public EmployeeProfileResponse getProfile(String employeeCode) {
        EmployeeInformation info = repo.findByEmployeeCodeFetchAll(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có mã: " + employeeCode));

        Contract contract = contractRepository.findFirstByUserEmployeeCodeOrderByStartDateDesc(employeeCode).orElse(null);

        return mapToProfile(info, contract);
    }

    @Transactional
    public EmployeeProfileResponse updateProfile(String employeeCode, String role, EmployeeProfileUpdateRequest request) {
        EmployeeInformation info = repo.findByEmployeeCodeFetchAll(employeeCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có mã: " + employeeCode));

        User user = info.getUser();
        Contract contract = contractRepository.findFirstByUserEmployeeCodeOrderByStartDateDesc(employeeCode).orElse(null);

        if (isEmployee(role)) {
            validateEmployeeFields(request);
            applyBasicUpdates(user, info, request);
        } else if (isHr(role)) {
            applyFullUpdates(user, info, contract, request);
        } else {
            throw new RuntimeException("Bạn không có quyền cập nhật hồ sơ");
        }

        userRepository.save(user);
        repo.save(info);
        if (contract != null) {
            contractRepository.save(contract);
        }

        return mapToProfile(info, contract);
    }

    private void applyBasicUpdates(User user, EmployeeInformation info, EmployeeProfileUpdateRequest request) {
        if (request.getPhone() != null) {
            user.setPhoneNo(request.getPhone());
        }
        if (request.getPersonalEmail() != null) {
            user.setEmail(request.getPersonalEmail());
        }
        if (request.getAddress() != null) {
            info.setAddress(request.getAddress());
        }
    }

    private void applyFullUpdates(User user, EmployeeInformation info, Contract contract, EmployeeProfileUpdateRequest request) {
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPersonalEmail() != null) {
            user.setEmail(request.getPersonalEmail());
        }
        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }
        if (request.getPhone() != null) {
            user.setPhoneNo(request.getPhone());
        }
        if (request.getPositionId() != null) {
            Position position = positionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy chức vụ với ID: " + request.getPositionId()));
            info.setPosition(position);
        }
        if (request.getTaxCode() != null) {
            info.setTaxNo(request.getTaxCode());
        }
        if (request.getCitizenId() != null) {
            info.setSocialNo(request.getCitizenId());
        }
        if (request.getAddress() != null) {
            info.setAddress(request.getAddress());
        }
        if (request.getDependentsNo() != null) {
            info.setDependentsNo(Integer.valueOf(request.getDependentsNo()));
        }

        if (contract != null) {
            if (request.getContractType() != null) {
                contract.setType(request.getContractType());
            }
            updateStatus(user, contract, request.getStatus());

            if (request.getJoinDate() != null) {
                contract.setStartDate(request.getJoinDate());
            }
            if (request.getVisaExpiry() != null) {
                contract.setEndDate(request.getVisaExpiry());
            }
            if (request.getContractUrl() != null) {
                contract.setPdfPath(request.getContractUrl());
            }
        } else {
            updateStatus(user, null, request.getStatus());
        }
    }

    private EmployeeProfileResponse mapToProfile(EmployeeInformation info, Contract contract) {
        User user = info.getUser();
        Position position = info.getPosition();
        LocalDate joinDate = contract != null ? contract.getStartDate() : null;
        LocalDate visaExpiry = contract != null ? contract.getEndDate() : null;

        String status = contract != null ? contract.getStatus() : resolveUserStatus(user.getStatus());
        String contractType = contract != null ? contract.getType() : null;
        String contractUrl = contract != null ? contract.getPdfPath() : null;
        int dependentsNo = info.getDependentsNo();

        return new EmployeeProfileResponse(
                user.getEmployeeCode(),
                user.getFullName(),
                position != null ? position.getName() : null,
                joinDate,
                user.getEmail(),
                contractType,
                user.getPhoneNo(),
                user.getDob(),
                status,
                info.getSocialNo(),
                info.getAddress(),
                visaExpiry,
                contractUrl,
                info.getTaxNo(),
                dependentsNo
        );
    }

    private String resolveUserStatus(Integer status) {
        if (Objects.equals(status, 1)) return "ACTIVE";
        if (Objects.equals(status, 0)) return "INACTIVE";
        return "UNKNOWN";
    }

    private void updateStatus(User user, Contract contract, String status) {
        if (status == null) {
            return;
        }

        if (contract != null) {
            contract.setStatus(status);
            return;
        }

        if (status.equalsIgnoreCase("ACTIVE")) {
            user.setStatus(1);
        } else if (status.equalsIgnoreCase("INACTIVE")) {
            user.setStatus(0);
        }
    }

    private boolean isEmployee(String role) {
        return role != null && role.equalsIgnoreCase("EMPLOYEE");
    }

    private boolean isHr(String role) {
        return role != null && role.equalsIgnoreCase("HR");
    }

    private void validateEmployeeFields(EmployeeProfileUpdateRequest request) {
        boolean hasRestrictedChange = request.getFullName() != null
                || request.getPositionId() != null
                || request.getDob() != null
                || request.getContractType() != null
                || request.getTaxCode() != null
                || request.getCitizenId() != null
                || request.getStatus() != null
                || request.getJoinDate() != null
                || request.getVisaExpiry() != null
                || request.getContractUrl() != null;

        if (hasRestrictedChange) {
            throw new RuntimeException("Nhân viên chỉ được phép cập nhật số điện thoại, địa chỉ và email");
        }
    }
}

