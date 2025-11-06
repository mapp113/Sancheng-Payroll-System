package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.LeaveStatus;
import com.g98.sangchengpayrollmanager.repository.LeaveRequestRepository;
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
    private final LeaveRequestRepository LeaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    @Override
    public LeaveRequestResponse submitLeaveRequest(LeaveRequestCreateDTO leaveRequestDTO) {
        User user = userRepository.findByEmployeeCode(leaveRequestDTO.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("User not found: " + leaveRequestDTO.getEmployeeCode()));

        LeaveRequest leaveRequest = mapToEntity(leaveRequestDTO, user);
        LeaveRequest savedLeaveRequest = LeaveRequestRepository.save(leaveRequest);

        return mapToResponse(savedLeaveRequest);
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
        entity.setFromDate(dto.getFromdate());
        entity.setToDate(dto.getTodate());
        entity.setDurationType(dto.getDuration());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStatus(LeaveStatus.valueOf(LeaveStatus.PENDING.name()));
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
                .status(LeaveStatus.valueOf(String.valueOf(entity.getStatus())))
                .approvalDate(entity.getApprovedDate() != null ? entity.getApprovedDate().toLocalDate() : null)
                .build();
    }
}
