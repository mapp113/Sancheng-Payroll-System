package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveBalance;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.model.enums.LeaveStatus;
import com.g98.sangchengpayrollmanager.repository.LeaveBalanceRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveRequestRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.service.LeaveRequestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final UserRepository userRepository;
    private final LeaveRequestRepository LeaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    @Override
    public LeaveRequestResponse submitLeaveRequest(LeaveRequestCreateDTO leaveRequestDTO) {
        User user = userRepository.findByEmployeeCode(leaveRequestDTO.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("User not found: " + leaveRequestDTO.getEmployeeCode()));

        LeaveType leaveType = leaveTypeRepository.findByCode(leaveRequestDTO.getLeaveType())
                .orElseThrow(() -> new RuntimeException("Leave type not found: " + leaveRequestDTO.getLeaveType()));

        if (Boolean.TRUE.equals(leaveType.getIsCountedAsLeave())) {
            LeaveBalance balance = leaveBalanceRepository.findByEmployeeCode(user.getEmployeeCode())
                    .orElseThrow(() -> new RuntimeException("Leave balance not found: " + user.getEmployeeCode()));
            double requestedDays = calculateLeaveDays(leaveRequestDTO.getFromDate(), leaveRequestDTO.getToDate(), leaveRequestDTO.getDuration());

            if (balance.getBalance() < requestedDays) {
                throw new IllegalArgumentException(
                        + balance.getBalance() + "ngày còn lại, không đủ" + requestedDays + "ngày.");
            }


            balance.setBalance((int) (balance.getBalance() - requestedDays));
            leaveBalanceRepository.save(balance);
        }


        LeaveRequest leaveRequest = mapToEntity(leaveRequestDTO, user);
        LeaveRequest savedLeaveRequest = LeaveRequestRepository.save(leaveRequest);

        return mapToResponse(savedLeaveRequest);
    }

    private double calculateLeaveDays(LocalDate fromDate, LocalDate toDate, String duration) {
        return 0;
    }

    @Override
    public List<LeaveRequestResponse> getAllLeaveRequests() {
        return LeaveRequestRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestResponse> getPendingLeaveRequests() {
        return LeaveRequestRepository.findByStatus(LeaveStatus.valueOf(LeaveStatus.PENDING.name()))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestResponse approveLeaveRequest(Integer id, String reason) {
        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRequest.setStatus(LeaveStatus.valueOf(LeaveStatus.APPROVED.name()));
        leaveRequest.setReason(reason);
        leaveRequest.setApprovedDate(LocalDateTime.now());



        return mapToResponse(LeaveRequestRepository.save(leaveRequest));
    }

    @Override
    public LeaveRequestResponse rejectLeaveRequest(Integer id, String reason) {
        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRequest.setStatus(LeaveStatus.valueOf(LeaveStatus.REJECTED.name()));
        leaveRequest.setReason(reason);
        leaveRequest.setApprovedDate(LocalDateTime.now());

        return mapToResponse(LeaveRequestRepository.save(leaveRequest));
    }



    private LeaveRequest mapToEntity(LeaveRequestCreateDTO dto, User user) {
        LeaveRequest entity = new LeaveRequest();
        entity.setUser(user);
        entity.setFromDate(dto.getFromDate());
        entity.setToDate(dto.getToDate());
        entity.setDurationType(DurationType.valueOf(dto.getDuration()));
        entity.setIsPaidLeave(false);
        entity.setReason(dto.getReason());
        entity.setStatus(LeaveStatus.valueOf(LeaveStatus.PENDING.name()));
        entity.setCreatedDate(LocalDateTime.now());
        return entity;
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest entity) {
        return LeaveRequestResponse.builder()
               // .id(entity.getId())
                .employeeCode(entity.getUser().getEmployeeCode())
                .fullName(entity.getUser().getFullName())
                .leaveType(entity.getLeaveType())
                .fromDate(entity.getFromDate())
                .toDate(entity.getToDate())
                .reason(entity.getReason())
                .duration(entity.getDurationType())
                .isPaidLeave(entity.getIsPaidLeave())
                .status(entity.getStatus())
                .approvalDate(entity.getApprovedDate() != null ?
                        entity.getApprovedDate().toLocalDate() : null)
                .note(entity.getReason())
                .build();
    }
}
