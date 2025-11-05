package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.LeaveStatus;
import com.g98.sangchengpayrollmanager.repository.LeaveRequestRespository;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.service.LeaveRequestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final UserRepository userRepository;
    private final LeaveRequestRespository leaveRequestRespository;
    private final LeaveTypeRepository leaveTypeRepository;

    @Override
    public LeaveRequestResponse submitLeaveRequest(LeaveRequestDTO leaveRequestDTO) {
        User user = userRepository.findByEmployeeCode(leaveRequestDTO.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("User not found: " + leaveRequestDTO.getEmployeeCode()));

        LeaveRequest leaveRequest = mapToEntity(leaveRequestDTO, user);
        LeaveRequest savedLeaveRequest = leaveRequestRespository.save(leaveRequest);

        return mapToResponse(savedLeaveRequest);
    }

    @Override
    public List<LeaveRequestResponse> getAllLeaveRequests() {
        return leaveRequestRespository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LeaveRequestResponse> getPendingLeaveRequests() {
        return leaveRequestRespository.findByStatus(LeaveStatus.valueOf(LeaveStatus.PENDING.name()))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveRequestResponse approveLeaveRequest(Integer id, String reason) {
        LeaveRequest leaveRequest = leaveRequestRespository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRequest.setStatus(LeaveStatus.APPROVED.name());
        leaveRequest.setReason(reason);
        leaveRequest.setApprovedDate(LocalDateTime.now());

        return mapToResponse(leaveRequestRespository.save(leaveRequest));
    }

    @Override
    public LeaveRequestResponse rejectLeaveRequest(Integer id, String reason) {
        LeaveRequest leaveRequest = leaveRequestRespository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRequest.setStatus(LeaveStatus.REJECTED.name());
        leaveRequest.setReason(reason);
        leaveRequest.setApprovedDate(LocalDateTime.now());

        return mapToResponse(leaveRequestRespository.save(leaveRequest));
    }


    private LeaveRequest mapToEntity(LeaveRequestDTO dto, User user) {
        LeaveRequest entity = new LeaveRequest();
        entity.setUser(user);
        entity.setFromDate(dto.getFromdate());
        entity.setToDate(dto.getTodate());
        entity.setDurationType(dto.getDuration());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStatus(LeaveStatus.PENDING.name());
        entity.setCreatedDate(LocalDateTime.now());
        return entity;
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest entity) {
        return LeaveRequestResponse.builder()
                .id(entity.getId())
                .employeeCode(entity.getUser().getEmployeeCode())
                .fullName(entity.getUser().getFullName())
                .leaveType(entity.getLeaveType())
                .startDate(entity.getFromDate())
                .endDate(entity.getToDate())
                .description(entity.getDescription())
                .title(entity.getTitle())
                .duration(entity.getDurationType())
                .status(LeaveStatus.valueOf(entity.getStatus()))
                .approvalDate(entity.getApprovedDate() != null ? entity.getApprovedDate().toLocalDate() : null)
                .build();
    }
}
