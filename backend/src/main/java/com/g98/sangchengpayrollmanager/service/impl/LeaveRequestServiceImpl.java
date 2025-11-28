package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveQuota;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.repository.*;
import com.g98.sangchengpayrollmanager.service.LeaveRequestService;
import com.g98.sangchengpayrollmanager.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {

    private final UserRepository userRepository;
    private final LeaveRequestRepository LeaveRequestRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveQuotaRepository leaveQuotaRepository;
    private static final String ANNUAL_LEAVE_CODE = "annual";
    private final SpecialDaysRepository specialDaysRepository;
    private final NotificationService notificationService;

    @Override
    public LeaveRequestResponse submitLeaveRequest(LeaveRequestCreateDTO leaveRequestDTO) {

        String username = getCurrentUsername();


        LocalDate today = LocalDate.now();
        LocalDate fromDate = leaveRequestDTO.getFromDate();
        LocalDate toDate = (leaveRequestDTO.getToDate() != null) ? leaveRequestDTO.getToDate() : leaveRequestDTO.getFromDate();

        leaveRequestDTO.setToDate(toDate);

        if (leaveRequestDTO.getFromDate().isBefore(today)) {
            throw new IllegalArgumentException("Ngày bắt đầu nghỉ phải từ hôm nay ");
        }

        if (leaveRequestDTO.getToDate().isBefore(leaveRequestDTO.getFromDate())) {
            throw new IllegalArgumentException("Ngày kết thúc không được nhỏ hơn ngày bắt đầu.");
        }

        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Không có người này: " + username));

        LeaveType leaveType = leaveTypeRepository.findByCode(leaveRequestDTO.getLeaveType())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngày nghỉ: " + leaveRequestDTO.getLeaveType()));


        boolean overlap = LeaveRequestRepository.existsOverlappingLeave(
                user.getEmployeeCode(), fromDate, toDate
        );
        if (overlap) {
            throw new IllegalArgumentException("Đã tồn tại đơn nghỉ trùng khoảng thời gian này.");
        }

        double requestedDays = calculateLeaveDays(fromDate, toDate, leaveRequestDTO.getDuration());
        boolean isPaidByType = Boolean.TRUE.equals(leaveType.getIsPaid());


        if (Boolean.TRUE.equals(leaveType.getIsCountedAsLeave()) && isPaidByType) {
            int year = fromDate.getYear();
            String emp = user.getEmployeeCode();
            String typeCode = leaveType.getCode();

            LeaveQuota quota = leaveQuotaRepository
                    .findByEmployeeCodeAndLeaveTypeCodeAndYear(emp, typeCode, year)
                    .orElseThrow(() -> new RuntimeException("Chưa tạo quota cho thành viên này trong năm nay"));

            if (quota.getEntitledDays() != null) {
                double limit = quota.getEntitledDays() + quota.getCarriedOver();
                double used = quota.getUsedDays() == null ? 0.0 : quota.getUsedDays();
                double remain = limit - used;

                if (requestedDays > remain) {
                    throw new IllegalArgumentException(" Không đủ số ngày nghỉ còn lại. Vui lòng tạo 2 yêu cầu khác nhau ");
                }
            }
        }
        LeaveRequest entity = mapToEntity(leaveRequestDTO, user, leaveType, isPaidByType);


        entity.setToDate(toDate);
        LeaveRequest savedLeaveRequest = LeaveRequestRepository.save(entity);

        List<User> managers  = userRepository.findAllManagers();

        for (User u : managers) {
            notificationService.createNotification(
                    managers.getLast().getEmployeeCode(),
                    "Có đơn xin nghỉ mới từ nhân viên ",
                    user.getFullName()
                            + " Đã xin nghỉ từ " + leaveRequestDTO.getFromDate()
                            + " tới " + leaveRequestDTO.getToDate() ,
                    "LEAVE_REQUEST",
                    savedLeaveRequest.getId()
            );
        }

        return mapToResponse(savedLeaveRequest);
    }



// tính toán số ngày nghỉ
    private double calculateLeaveDays(LocalDate fromDate, LocalDate toDate, String duration) {
       DurationType durationType = DurationType.valueOf(duration.trim().toUpperCase());
       switch (durationType) {
           case FULL_DAY -> {
               double days = 0.0;
               LocalDate date = fromDate;
               while (!date.isAfter(toDate)) {
                   if(isWorkingDay(date)) {
                       days++;
                   }
                   date = date.plusDays(1);
               }
               return days;

           }
//           case HALF_DAY_AM, HALF_DAY_PM -> {
//               return (fromDate.toEpochDay() - toDate.toEpochDay()) / 2;
//           }
           default -> throw new RuntimeException("Unsupported duration type: " + durationType);
       }
    }

    // Tinh số ngày còn lại của nghỉ phép năm
    @Override
    public double getMyAnnualRemainingLeave() {

            String username = getCurrentUsername();

            User user  = userRepository.findByUsernameWithRole(username)
                    .orElseThrow(() -> new RuntimeException("người không tồn tại: " + username));

            String  empCode = user.getEmployeeCode();
            int year = LocalDate.now().getYear();

            LeaveQuota quota = leaveQuotaRepository
                    .findByEmployeeCodeAndLeaveTypeCodeAndYear(empCode, ANNUAL_LEAVE_CODE, year)
                    .orElseThrow(() -> new RuntimeException("Chưa có quota thành viên này trong năm nay"));
            Double entitledDays = quota.getEntitledDays();
            Double carried = quota.getCarriedOver() == null ? 0.0 : quota.getCarriedOver();
            Double used = quota.getUsedDays() == null ? 0.0 : quota.getUsedDays();

        double remainingDays = Math.max((entitledDays+ carried) - used, 0.0);

        return remainingDays;

    }


    // Xóa đơn chưa duyệt
    @Override
    public void deleteMyLeaveRequest(Integer id) {
        String username = getCurrentUsername();

        User user  = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("người không tồn tại: " + username));

        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yêu cầu không tồn tại: " + id));

        if(!leaveRequest.getUser().getEmployeeCode().equals(user.getEmployeeCode())) {
            throw new RuntimeException("Xóa đơn nghỉ của chính mình.");
        }

        if (!LeaveandOTStatus.PENDING.name().equals(leaveRequest.getStatus())) {
            throw new IllegalArgumentException(" Chỉ được xóa đơn ở trạng thái PENDING");
        }
        LeaveRequestRepository.delete(leaveRequest);
    }


    // Lấy cho Manager xem
    @Override
    public Page<LeaveRequestResponse> getAllLeaveRequests(Integer month, Integer year, Pageable pageable) {
        Page<LeaveRequest> page = LeaveRequestRepository
                .filterByMonthYear(month, year, pageable);
        return page.map(this::mapToResponse);
    }

    // Laays cho Employee xem của người ta

    @Override
    public Page<LeaveRequestResponse> getMyLeaveRequests(Pageable pageable) {
        String username = getCurrentUsername();

        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("người ko tồn tại: " + username));

        return LeaveRequestRepository
                .findByUser_EmployeeCode(user.getEmployeeCode(), pageable)
                .map(this::mapToResponse);
    }

    // Xem chi tiết yêu câầu của chính người gửi


    @Override
    public Page<LeaveRequestResponse> findByStatus(LeaveandOTStatus status, Pageable pageable) {
        return LeaveRequestRepository
                .findByStatus(LeaveandOTStatus.valueOf(String.valueOf(status)), pageable)
                .map(this::mapToResponse);

    }

    @Override
    public Page<LeaveRequestResponse> searchLeaveRequests(String keyword, Pageable pageable) {

        keyword = (keyword == null) ? "" : keyword.trim();
        keyword = keyword.toUpperCase();

        Page<LeaveRequest> pageResult =
                LeaveRequestRepository.searchByEmployeeCodeOrName(keyword, pageable);

        return pageResult.map(this::mapToResponse);
    }



    @Override
    public LeaveRequestResponse getLeaveRequestDetail(Integer id) {
        String username = getCurrentUsername();

        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại: " + username));

        LeaveRequest request = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn nghỉ"));

        boolean isManager = user.getRole().getName().equalsIgnoreCase("MANAGER")
                || user.getRole().getName().equalsIgnoreCase("HR");

        // Employee chỉ xem đơn của chính họ
        if (!isManager && !request.getUser().getEmployeeCode().equals(user.getEmployeeCode())) {
            throw new RuntimeException("Bạn không có quyền xem đơn nghỉ của người khác.");
        }

        return mapToResponse(request);
    }


    @Override
    public LeaveRequestResponse approveLeaveRequest(Integer id, String note) {

        String username = getCurrentUsername();

        User approver = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại: " + username));

        String roleName = approver.getRole().getName();

        if ("HR".equals(roleName)) {
            throw new RuntimeException("HR chỉ được xem, không được từ chối đơn nghỉ.");
        }

        if (!"Manager".equals(roleName)) {
            throw new RuntimeException("Chỉ Manager mới được phê duyệt đơn nghỉ.");
        }

        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yêu cầu nghỉ ko tồn tại"));


        if (leaveRequest.getUser().getEmployeeCode().equals(approver.getEmployeeCode())) {
            throw new RuntimeException("Manager không được tự phê duyệt đơn nghỉ của chính mình.");
        }


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
        LeaveRequest savedLeaveRequest = LeaveRequestRepository.save(leaveRequest);

        User employee = leaveRequest.getUser();

        notificationService.createNotification(
                employee.getEmployeeCode(),
                "Đơn xin nghỉ của bạn đã được chấp nhận ",
                " Đơn xin nghỉ ngày " + leaveRequest.getFromDate() +
                        " Tới ngày " +leaveRequest.getToDate() + " đã được duyệt ",
                "LEAVE_APPROVED",
                savedLeaveRequest.getId()
        );
        return mapToResponse(savedLeaveRequest);
    }

    @Override
    public LeaveRequestResponse rejectLeaveRequest(Integer id, String note) {
        String username = getCurrentUsername();
        User approver = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại : " + username));

        String roleName = approver.getRole().getName();

        if ("HR".equals(roleName)) {
            throw new RuntimeException("HR chỉ được xem, không được từ chối đơn nghỉ.");
        }

        if (!"Manager".equals(roleName)) {
            throw new RuntimeException("Chỉ Manager mới được từ chối đơn nghỉ.");
        }

        LeaveRequest leaveRequest = LeaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yêu cầu nghỉ ko tồn tại"));


        if (leaveRequest.getUser().getEmployeeCode().equals(approver.getEmployeeCode())) {
            throw new RuntimeException("Manager không được tự từ chối đơn nghỉ của chính mình.");
        }

        leaveRequest.setStatus(LeaveandOTStatus.REJECTED.name());
        leaveRequest.setNote(note);
        leaveRequest.setApprovedDate(LocalDateTime.now());
        LeaveRequest savedLeaveRequest = LeaveRequestRepository.save(leaveRequest);

        User employee = leaveRequest.getUser();

        notificationService.createNotification(
                employee.getEmployeeCode(),
                "Đơn xin nghỉ của bạn đã không được chấp nhận ",
                " Đơn xin nghỉ ngày " + leaveRequest.getFromDate() +
                        " Tới ngày " +leaveRequest.getToDate() + " không được duyệt ",
                "LEAVE_APPROVED",
                savedLeaveRequest.getId()
        );
        return mapToResponse(savedLeaveRequest);
    }

    private boolean isWorkingDay(LocalDate date) {
        if (specialDaysRepository.existsByDate(date)) {
            return false;
        }
        return switch (date.getDayOfWeek()) {
            case SATURDAY, SUNDAY -> false;
            default -> true;
        };
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
