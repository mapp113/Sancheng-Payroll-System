package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveQuota;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.repository.LeaveQuotaRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveRequestRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import com.g98.sangchengpayrollmanager.service.LeaveRequestService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final UserRepository userRepository;
    private final LeaveRequestRepository LeaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveQuotaRepository leaveQuotaRepository;

    @Override
    public LeaveRequestResponse submitLeaveRequest(LeaveRequestCreateDTO leaveRequestDTO) {

        String username = getCurrentUsername();


        try {
            User user = userRepository.findByUsernameWithRole(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            LeaveType leaveType = leaveTypeRepository.findByCode(leaveRequestDTO.getLeaveType())
                 .orElseThrow(() -> new RuntimeException("Leave type not found: " + leaveRequestDTO.getLeaveType()));


         LocalDate fromDate = leaveRequestDTO.getFromDate();
         LocalDate toDate = (leaveRequestDTO.getToDate() != null) ? leaveRequestDTO.getToDate() : leaveRequestDTO.getFromDate();
         double requestedDays = calculateLeaveDays(fromDate, toDate, leaveRequestDTO.getDuration());

         boolean isPaidByType = Boolean.TRUE.equals(leaveType.getIsPaid());


         if (Boolean.TRUE.equals(leaveType.getIsCountedAsLeave()) && isPaidByType) {
             int year = fromDate.getYear();
             String emp = user.getEmployeeCode();
             String typeCode = leaveType.getCode();

             LeaveQuota quota = leaveQuotaRepository
                     .findByEmployeeCodeAndLeaveTypeCodeAndYear(emp,typeCode, year)
                     .orElseThrow(() -> new RuntimeException("Chưa tạo quota cho thành viên này trong năm nay"));

             if (quota.getEntitledDays() != null){
                 double limit = quota.getEntitledDays() + quota.getCarriedOver();
                 double used =  quota.getUsedDays()  == null ? 0.0 : quota.getUsedDays();
                 double remain = limit - used;

                 if (requestedDays > remain) {
                     throw  new IllegalArgumentException(" Không đủ số ngày nghỉ còn lại. Vui lòng tạo 2 yêu cầu khác nhau ");
                 }
             }
         }
         LeaveRequest entity = mapToEntity(leaveRequestDTO, user, leaveType, isPaidByType);

         // thêm file sau này sẽ thêm
//         if (leaveRequestDTO.getAttachment() != null && !leaveRequestDTO.getAttachment().isEmpty()) {
//             String fileName = leaveRequestDTO.getAttachment().getOriginalFilename();
//             Path uploadPath = Paths.get(System.getProperty("user.dir"), fileName);
//
//             try {
//                 Files.createDirectories(uploadPath.getParent());
//                 Path filePath = uploadPath.resolve(fileName);
//                 leaveRequestDTO.getAttachment().transferTo(filePath.toFile());
//                 entity.setAttachmentPath(fileName.toString());
//             } catch (IOException e ) {
//                 throw new RuntimeException(e);
//             }
//         }

             entity.setToDate(toDate);
         LeaveRequest savedLeaveRequest = LeaveRequestRepository.save(entity);

         return mapToResponse(savedLeaveRequest);

     } catch (Exception e) {
         throw new RuntimeException(e.getMessage());
     }
    }

    private double calculateLeaveDays(LocalDate fromDate, LocalDate toDate, String duration) {
       DurationType durationType = DurationType.valueOf(duration.trim().toUpperCase());
       switch (durationType) {
           case FULL_DAY -> {
               long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
               return (double) days;
           }
           case HALF_DAY_AM, HALF_DAY_PM -> {
               return (fromDate.toEpochDay() - toDate.toEpochDay()) / 2;
           }
           default -> throw new RuntimeException("Unsupported duration type: " + durationType);
       }
    }


    // ấy cho Manager xem
    @Override
    public Page<LeaveRequestResponse> getAllLeaveRequests(Pageable pageable) {
        return LeaveRequestRepository
                .findAll(pageable)
                .map(this::mapToResponse);
    }


    // Laays cho Employee xem của người ta

    @Override
    public Page<LeaveRequestResponse> findByUser_Id(String employeeCode, Pageable pageable) {
        return LeaveRequestRepository
                .findByUser_EmployeeCode(employeeCode, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<LeaveRequestResponse> findByStatus(LeaveandOTStatus status, Pageable pageable) {
        return LeaveRequestRepository
                .findByStatus(LeaveandOTStatus.valueOf(String.valueOf(status)), pageable)
                .map(this::mapToResponse);

    }

    @Override
    public Page<LeaveRequestResponse> searchLeaveRequests(String keyword, Pageable pageable) {
        keyword = (keyword == null) ? "" : keyword.trim();

        Page<LeaveRequest> pageResult =
                LeaveRequestRepository.searchByEmployeeCodeOrName(keyword, pageable);

        return pageResult.map(this::mapToResponse);
    }

    @Override
    public Page<LeaveRequestResponse> getAllLeaveRequests(Integer month, Integer year, Pageable pageable) {
        Page<LeaveRequest> page = LeaveRequestRepository
                .filterByMonthYear(month, year, pageable);
        return page.map(this::mapToResponse);
    }


    @Override
    public LeaveRequestResponse getLeaveRequestDetail(Integer id) {
        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found: " + id));

        // Còn phải codephanafn quyền chỉ Manager xem được của tất cả. với Employee thì chỉ xem được của chính minhd
        return mapToResponse(leaveRequest);
    }

    @Override
    public LeaveRequestResponse approveLeaveRequest(Integer id, String note) {

        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

//        if (LeaveandOTStatus.APPROVED.name().equals(leaveRequest.getStatus())) {
//            return mapToResponse(leaveRequest);
//        }

        LocalDate fromDate = leaveRequest.getFromDate();
        LocalDate toDate = (leaveRequest.getToDate() != null) ? leaveRequest.getToDate() : leaveRequest.getFromDate();
        double requestedDays = calculateLeaveDays(fromDate, toDate, leaveRequest.getDurationType().name());

        LeaveType leaveType = leaveRequest.getLeaveType();

        boolean counted = Boolean.TRUE.equals(leaveType.getIsCountedAsLeave());
        boolean paidByRequest = Boolean.TRUE.equals(leaveRequest.getIsPaidLeave());

        if (counted && paidByRequest) {

            int year = leaveRequest.getFromDate().getYear();
            String emp = leaveRequest.getUser().getEmployeeCode();
            String typeCode = leaveType.getCode();


            LeaveQuota quota = leaveQuotaRepository
                    .findByEmployeeCodeAndLeaveTypeCodeAndYear(emp, typeCode, year)
                    .orElseThrow(() -> new RuntimeException("Quota not found"));

            if (quota.getEntitledDays() != null){

                double limit = quota.getEntitledDays() + quota.getCarriedOver();
                double used =  quota.getUsedDays()  == null ? 0.0 : quota.getUsedDays();
                double remain = limit - used;

                if (requestedDays > remain) {
                    throw new IllegalArgumentException(" Không đủ số ngày nghỉ còn lại. Vui lòng tạo 2 yêu cầu khác nhau " );
                }
                quota.setUsedDays(used + requestedDays);
                leaveQuotaRepository.save(quota);
            }
        }

        leaveRequest.setStatus(LeaveandOTStatus.APPROVED.name());
        leaveRequest.setNote(note);
        leaveRequest.setApprovedDate(LocalDateTime.now());

        return mapToResponse(LeaveRequestRepository.save(leaveRequest));
    }

    @Override
    public LeaveRequestResponse rejectLeaveRequest(Integer id, String note) {
        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRequest.setStatus(LeaveandOTStatus.REJECTED.name());
        leaveRequest.setNote(note);
        leaveRequest.setApprovedDate(LocalDateTime.now());

        return mapToResponse(LeaveRequestRepository.save(leaveRequest));
    }


    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("ko co nguoi dung");
        }
        return auth.getName();
    }


    private LeaveRequest mapToEntity(LeaveRequestCreateDTO dto, User user, LeaveType leaveType, boolean isPaidByType) {
        LeaveRequest entity = new LeaveRequest();
        entity.setUser(user);
        entity.setLeaveType(leaveType);
        entity.setFromDate(dto.getFromDate());
        entity.setToDate(dto.getToDate());
        entity.setDurationType(DurationType.valueOf(dto.getDuration()));;
        entity.setIsPaidLeave(isPaidByType);
        entity.setReason(dto.getReason());
        entity.setStatus(LeaveandOTStatus.PENDING.name());
        entity.setCreatedDate(LocalDateTime.now());
        return entity;
    }

    private LeaveRequestResponse mapToResponse(LeaveRequest entity) {
        return LeaveRequestResponse.builder()
                .id(entity.getId())
                .employeeCode(entity.getUser().getEmployeeCode())
                .fullName(entity.getUser().getFullName())
                .leaveTypeCode(entity.getLeaveType().getCode())
                .fromDate(entity.getFromDate())
                .toDate(entity.getToDate())
                .reason(entity.getReason())
                .duration(entity.getDurationType())
                .isPaidLeave(entity.getIsPaidLeave())
                .file(entity.getAttachmentPath())
                .createDate(entity.getCreatedDate() != null
                        ? entity.getCreatedDate().toLocalDate()
                        : null)
                .status(LeaveandOTStatus.valueOf(entity.getStatus()))
                .approvalDate(entity.getApprovedDate() != null ?
                        entity.getApprovedDate().toLocalDate() : null)
                .note(entity.getNote())
                .build();
    }
}
