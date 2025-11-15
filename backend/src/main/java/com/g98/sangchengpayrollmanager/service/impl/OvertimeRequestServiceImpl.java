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
import com.g98.sangchengpayrollmanager.service.validator.RequestValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.sql.ast.tree.expression.Over;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
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
    private final RequestValidator requestValidator;

    @Override
    public OvertimeRequestResponse submitOvertimeRequest(OvertimeRequestCreateDTO overtimeRequestDTO) {


        String username = getCurrentUsername();
        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        LocalDate otDate = requestValidator.validateOvertime(overtimeRequestDTO);


        OvertimeRequest entity = mapToEntity(overtimeRequestDTO, user, otDate);
       OvertimeRequest savedOvertimeRequest = OvertimeRequestRespository.save(entity);
        return mapToResponse(savedOvertimeRequest);
    }

    @Override
    public Page<OvertimeRequestResponse> getAllOvertimeRequests(int page, int size) {
        return null;
    }

    @Override
    public Page<OvertimeRequestResponse> getPendingOvertimeRequests(int page, int size) {
        return null;
    }


    @Override
    public OvertimeRequestResponse approveOvertimeRequest(Integer overtimeRequestId, String note) {
        OvertimeRequest ot = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Đơn xin overtime ko tồn tại: " + overtimeRequestId));
        if (!LeaveandOTStatus.PENDING.name().equals(ot.getStatus())) {
            throw new IllegalStateException("Chỉ duyệt đơn OT ở trạng thái PENDING");
        }

        ot.setStatus(LeaveandOTStatus.APPROVED.name());
        ot.setApprovedDateOT(LocalDateTime.now());
        ot.setNoteOT(note);
        return mapToResponse(overtimeRequestRespository.save(ot));
    }

    @Override
    public OvertimeRequestResponse rejectOvertimeRequest(Integer overtimeRequestId, String note) {
        OvertimeRequest ot = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Overtime request not found"));

        if (!LeaveandOTStatus.PENDING.name().equals(ot.getStatus())) {
            throw new IllegalStateException("Chỉ duyệt đơn OT ở trạng thái PENDING");
        }

        ot.setStatus(LeaveandOTStatus.REJECTED.name());
        ot.setApprovedDateOT(LocalDateTime.now());
        ot.setNoteOT(note);
        return mapToResponse(overtimeRequestRespository.save(ot));

    }


    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("ko co nguoi dung");
        }
        return auth.getName();
    }


    private OvertimeRequest mapToEntity(OvertimeRequestCreateDTO overtimeRequestDTO, User user, LocalDate otDate) {
        LocalDateTime fromTime = overtimeRequestDTO.getFromTime();
        LocalDateTime toTime = overtimeRequestDTO.getToTime();
        long workedHours = Duration.between(fromTime, toTime).toHours();

        return OvertimeRequest.builder()
                .otDate(LocalDateTime.from(otDate))
                .fromTime(fromTime)
                .toTime(toTime)
                .workedTime((int) workedHours)
                .user(user)
                .reason(overtimeRequestDTO.getReason())
                .status(LeaveandOTStatus.PENDING.name())
                .createdDateOT(LocalDateTime.now())
                .build();

    }

    private OvertimeRequestResponse mapToResponse(OvertimeRequest entity) {
        return OvertimeRequestResponse.builder()
                .id(entity.getId())
                .employeeCode(entity.getUser().getEmployeeCode())
                .fullName(entity.getUser().getFullName())
                .fromTime(entity.getFromTime())
                .toTime(entity.getToTime())
                .workedTime(entity.getWorkedTime())
                .reason(entity.getReason())
                .status(LeaveandOTStatus.valueOf(entity.getStatus()))
                .createdDateOT(entity.getCreatedDateOT())
                .approvedDateOT(entity.getApprovedDateOT())
                .note(entity.getNoteOT())
                .build();
    }

}
