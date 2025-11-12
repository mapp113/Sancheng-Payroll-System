package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.OvertimeRequest;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.repository.OvertimeRequestRespository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.service.OvertimeRequestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OvertimeRequestServiceImpl implements OvertimeRequestService {


    private final UserRepository userRepository;
    private final OvertimeRequestRespository OvertimeRequestRespository;
    private final OvertimeRequestRespository overtimeRequestRespository;


    @Override
    public OvertimeRequestResponse submitOvertimeRequest(OvertimeRequestCreateDTO dto) {
        User user = userRepository.findByEmployeeCode(dto.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("User not found: " + dto.getEmployeeCode()));

        long hours = Duration.between(dto.getFromTime(), dto.getToTime()).toHours();

        OvertimeRequest overtimeRequest = OvertimeRequest.builder()
                .user(user)
                .fromTime(dto.getFromTime())
                .toTime(dto.getToTime())
                .workedTime((int) hours)
                .status(String.valueOf(LeaveandOTStatus.PENDING))
                .createdDateOT(LocalDateTime.now())
                .build();

        OvertimeRequest savedOvertimeRequest = OvertimeRequestRespository.save(overtimeRequest);
        return mapToResponse(savedOvertimeRequest);
    }


    @Override
    public List<OvertimeRequestResponse> getAllOvertimeRequests() {
        return overtimeRequestRespository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OvertimeRequestResponse> getPendingOvertimeRequests() {
        return overtimeRequestRespository.findByStatus(String.valueOf(LeaveandOTStatus.PENDING))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OvertimeRequestResponse approveOvertimeRequest(Integer overtimeRequestId, String note) {
        OvertimeRequest ot = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Overtime request not found: " + overtimeRequestId));
        return mapToResponse(overtimeRequestRespository.save(ot));
    }

    @Override
    public OvertimeRequestResponse rejectOvertimeRequest(Integer overtimeRequestId, String note) {
        OvertimeRequest ot = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Overtime request not found"));

        ot.setStatus(LeaveandOTStatus.REJECTED.name());
        ot.setApprovedDateOT(LocalDateTime.now());
        ot.setNoteOT(note);
        return mapToResponse(overtimeRequestRespository.save(ot));

    }

    private OvertimeRequestResponse mapToResponse(OvertimeRequest entity) {
        return OvertimeRequestResponse.builder()
                .id(entity.getId())
                .employeeCode(entity.getUser().getEmployeeCode())
                .fullName(entity.getUser().getFullName())
                .fromTime(entity.getFromTime())
                .toTime(entity.getToTime())
                .workedTime(entity.getWorkedTime())
                .status(LeaveandOTStatus.valueOf(entity.getStatus()))
                .createdDateOT(entity.getCreatedDateOT())
                .approvedDateOT(entity.getApprovedDateOT())
                .note(entity.getNoteOT())
                .build();
    }

}
