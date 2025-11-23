package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.*;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.repository.*;
import com.g98.sangchengpayrollmanager.service.OvertimeRequestService;
import com.g98.sangchengpayrollmanager.service.validator.RequestValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class OvertimeRequestServiceImpl implements OvertimeRequestService {


    private final UserRepository userRepository;
    private final OvertimeRequestRespository overtimeRequestRespository;
    private final RequestValidator requestValidator;
    private final DayTypeRepository dayTypeRepository;
    private final SpecialDaysRepository specialDaysRepository;
    private final OvertimeBalanceRepository overtimeBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveQuotaRepository leaveQuotaRepository;

    @Override
    public OvertimeRequestResponse submitOvertimeRequest(OvertimeRequestCreateDTO overtimeRequestDTO) {


        String username = getCurrentUsername();
        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        LocalDate otDate = requestValidator.validateOvertime(overtimeRequestDTO);

        WeekFields wf = WeekFields.of(Locale.getDefault());
//        int weekOfMonth = otDate.get(wf.weekOfMonth());
//        int weekOfYear = otDate.get(wf.weekOfYear());

        DayType dayType = resolveDayType(otDate);

        long workedHours = Duration.between(overtimeRequestDTO.getFromTime(),
                                            overtimeRequestDTO.getToTime()).toHours();

        LocalDate monthStart = LocalDate.of(otDate.getYear(), otDate.getMonth(), 1);
        LocalDate monthEnd   = otDate.withDayOfMonth(otDate.lengthOfMonth());


        boolean hasOverlap = overtimeRequestRespository.existsOverlappingRequest(
                user.getEmployeeCode(),
                otDate,
                overtimeRequestDTO.getFromTime(),
                overtimeRequestDTO.getToTime());

        if (hasOverlap) {
            throw new IllegalArgumentException(
                    "Khoảng thời gian OT này bị trùng với một đơn OT khác (đang chờ duyệt hoặc đã được duyệt) trong cùng ngày."
            );
        }

        int monthlyHours = overtimeRequestRespository.sumWorkedHoursInMonth(
                user.getEmployeeCode(), monthStart, monthEnd);

        if(monthlyHours + workedHours > 40 ){
            throw new IllegalArgumentException(  "Tổng số giờ OT trong tuần (bao gồm đơn này) không được vượt quá 10 giờ. "
                                                  +"Hiện tại bạn đã đăng ký " + monthlyHours + " giờ trong tuần này.");


        }

        OvertimeRequest entity = mapToEntity(overtimeRequestDTO, user, otDate, dayType, (int) workedHours);
       OvertimeRequest savedOvertimeRequest = overtimeRequestRespository.save(entity);


        return mapToResponse(savedOvertimeRequest);
    }

    @Override
    public Page<OvertimeRequestResponse> getMyOvertimeRequest(Pageable pageable) {
        String username = getCurrentUsername();
        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException(" Người không tồn tại " + username));

        return overtimeRequestRespository.findByUser_EmployeeCode(user.getEmployeeCode(), pageable)
                .map(this::mapToResponse);
    }

    @Override
    public void deleteOvertimeRequest(Integer overtimeRequestId) {
        String username = getCurrentUsername();

        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException(" Người không tồn tại " + username));

        OvertimeRequest overtimeRequest = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Đơn OT không tồn tại: " + overtimeRequestId));


        if(!overtimeRequest.getUser().getEmployeeCode().equals(user.getEmployeeCode())){
            throw new RuntimeException("Chỉ được xóa đơn của mình");
        }
        if(!LeaveandOTStatus.PENDING.name().equals(overtimeRequest.getStatus())){
            throw new IllegalArgumentException(" Chỉ xóa đơn đang chờ ");
        }

        overtimeRequestRespository.delete(overtimeRequest);
    }

    @Override
    public OvertimeRequestResponse getOvertimeRequestDetail(Integer overtimeRequestId) {
        String username = getCurrentUsername();

        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException(" Người không tồn tại " + username));

        OvertimeRequest overtimeRequest = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Đơn OT không tồn tại: " + overtimeRequestId));

        boolean isManager = user.getRole().getName().equalsIgnoreCase("MANAGER")
                || user.getRole().getName().equalsIgnoreCase("HR");

        if(!isManager && !overtimeRequest.getUser().getEmployeeCode().equals(user.getEmployeeCode())){
            throw new RuntimeException("Bạn ko được xem đơn của người khác");
        }
        return mapToResponse(overtimeRequest);
    }

    @Override
    public Page<OvertimeRequestResponse> getAllOvertimeRequests(Integer month, Integer year, Pageable pageable) {
        Page<OvertimeRequest> page = overtimeRequestRespository.filterByMonthYear(month, year, pageable);
        return page.map(this::mapToResponse);
    }


    @Override
    public OvertimeRequestResponse approveOvertimeRequest(Integer overtimeRequestId, String note) {
        OvertimeRequest overtimeRequest = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Đơn xin overtime ko tồn tại: " + overtimeRequestId));
        if (!LeaveandOTStatus.PENDING.name().equals(overtimeRequest.getStatus())) {
            throw new IllegalStateException("Chỉ duyệt đơn OT ở trạng thái PENDING");
        }

        overtimeRequest.setStatus(LeaveandOTStatus.APPROVED.name());
        overtimeRequest.setApprovedDateOT(LocalDateTime.now());
        overtimeRequest.setNoteOT(note);

        OvertimeRequest savedOvertimeRequest = overtimeRequestRespository.save(overtimeRequest);
        int workHours = ( overtimeRequest.getWorkedTime() == null) ? 0 : overtimeRequest.getWorkedTime();
        if (workHours > 0) {
            upsertOvertimeBalance(overtimeRequest.getUser(), overtimeRequest.getOtDate(), workHours);
        }

        changeOvertimetoLeaveWithMonthlyOverLimit(overtimeRequest.getUser(), overtimeRequest.getOtDate());
        return mapToResponse(savedOvertimeRequest);
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

    @Override
    public Page<OvertimeRequestResponse> searchOvertimeRequests(String keyword, Pageable pageable) {

        keyword = (keyword == null) ? "" : keyword.trim();
        keyword = keyword.toUpperCase();

        Page<OvertimeRequest> pageResult = overtimeRequestRespository.searchByEmployeeCodeOrName(keyword, pageable);
        return pageResult.map(this::mapToResponse);

    }

    @Override
    public Page<OvertimeRequestResponse> findByStatus(LeaveandOTStatus status, Pageable pageable) {
        return  overtimeRequestRespository
                .findByStatus(status.name(), pageable)
                .map(this::mapToResponse);
    }



    // Tính thời gian còn lại
    @Override
    public Integer getMyRemainingMonthlyOvertime() {
        String username = getCurrentUsername();

        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException(" Người không tồn tại " + username));

        LocalDate today = LocalDate.now();

        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate monthEnd   = today.withDayOfMonth(today.lengthOfMonth());

        int monthlyHours = overtimeRequestRespository.sumWorkedHoursInMonth(
                user.getEmployeeCode(), monthStart, monthEnd
        );

        int maxMonthlyHours = 40;
        int remaining = maxMonthlyHours - monthlyHours;

        return Math.max(0, remaining);
    }

    public void changeOvertimetoLeaveWithMonthlyOverLimit(User user, LocalDate otDate) {
        String empCode = user.getEmployeeCode();
        int year = otDate.getYear();
        int month = otDate.getMonthValue();

        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = otDate.withDayOfMonth(otDate.lengthOfMonth());

        int monthlyHours = overtimeRequestRespository.sumWorkedHoursInMonth(
                empCode, monthStart, monthEnd);

        int monthlimit = 40;
        int excessHours = monthlyHours - monthlimit;

        if (excessHours <= 0) {
            return;
        }

        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd   = LocalDate.of(year, 12, 31);
        int yearlyHours = overtimeRequestRespository.sumWorkedHoursInYear(
                empCode, yearStart, yearEnd
        );

        int yearlyLimit = 200;
        boolean exceedYearLimit = yearlyHours > yearlyLimit;


        LeaveType compType = leaveTypeRepository.findByCode("OT_COMP")
                .orElseGet(() -> {
                    LeaveType leaveType = new LeaveType();
                    leaveType.setCode("OT_COMP");
                    leaveType.setName("Nghỉ bù OT");
                    leaveType.setIsCountedAsLeave(true);
                    leaveType.setIsPaid(true);
                    leaveType.setNote("Tự động tạo khi OT vượt quá 40h/tháng");
                    return leaveTypeRepository.save(leaveType);
                });



        LeaveQuota quota = leaveQuotaRepository.findByEmployeeCodeAndLeaveTypeCodeAndYear(empCode, compType.getCode(), year)
                .orElseGet(() -> {
                    LeaveQuota q = new LeaveQuota();
                    q.setEmployeeCode(empCode);
                    q.setLeaveTypeCode("OT_COMP");
                    q.setLeaveType(compType);
                    q.setYear(LocalDate.now().getYear());
                    q.setEntitledDays(0.0);
                    q.setCarriedOver(0.0);
                    q.setUsedDays(0.0);
                    return q;
                });

        double prevRemainder = quota.getCarriedOver() == null ? 0.0 : quota.getCarriedOver();
        double totalRemainder = prevRemainder + excessHours;
        int extraDays = (int) (totalRemainder / 8);
        double newRemainder = totalRemainder % 8;
        if (extraDays > 0) {
            double currentEntitled = quota.getEntitledDays() == null ? 0.0 : quota.getEntitledDays();
            quota.setEntitledDays(currentEntitled + extraDays);
        }


        quota.setCarriedOver(newRemainder);
        leaveQuotaRepository.save(quota);

    }




    // tạo overtime_balance mới cho tuần đó
    private void upsertOvertimeBalance(User user, LocalDate otDate, int workedHours) {
        WeekFields wf = WeekFields.of(Locale.getDefault());
        int weekOfMonth = otDate.get(wf.weekOfMonth());
        int year  = otDate.getYear();
        int month = otDate.getMonthValue();

        OvertimeBalance balance = overtimeBalanceRepository.
                                  findByUserEmployeeCodeAndYearAndMonthAndWeekOfMonth(
                                          user.getEmployeeCode(), year, month, weekOfMonth )
                .orElseGet(() -> OvertimeBalance.builder()
                        .user(user)
                        .year(year)
                        .month(month)
                        .weekOfMonth(weekOfMonth)
                        .hourBalance(0)
                        .build()
                );

        int currentWorkedHours = (balance.getHourBalance()== null) ? 0 : balance.getHourBalance();
        balance.setHourBalance(currentWorkedHours + workedHours);

        overtimeBalanceRepository.save(balance);
    }


    // xác định dạng ngày ot
    private DayType resolveDayType(LocalDate otDate) {

        if (specialDaysRepository.existsByDate(otDate)) {
            return dayTypeRepository.findByNameIgnoreCase("Holiday")
                    .orElseThrow(() -> new IllegalArgumentException("khoong tìm thấy ngày lẽ "));
        }

        var dow = otDate.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return dayTypeRepository.findByNameIgnoreCase("Weekend")
                    .orElseThrow(() -> new IllegalArgumentException("khoong tìm thấy ngày "));
        }

        return dayTypeRepository.findByNameIgnoreCase("Working Day")
                .orElseThrow(() -> new IllegalArgumentException("khoong tìm thấy ngày "));
    }


    // xác định ngươời gửi đơn
    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("ko co nguoi dung");
        }
        return auth.getName();
    }



    private OvertimeRequest mapToEntity(OvertimeRequestCreateDTO overtimeRequestDTO, User user, LocalDate otDate, DayType dayType, int workedHours) {
        LocalDateTime fromTime = overtimeRequestDTO.getFromTime();
        LocalDateTime toTime = overtimeRequestDTO.getToTime();

        return OvertimeRequest.builder()
                .otDate(otDate)
                .fromTime(fromTime)
                .toTime(toTime)
                .workedTime(workedHours)
                .user(user)
                .dayType(dayType)
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
                .otDate(entity.getOtDate())
                .fromTime(entity.getFromTime())
                .toTime(entity.getToTime())
                .workedTime(entity.getWorkedTime())
                .reason(entity.getReason())
                .dayTypeId(entity.getDayType().getId())
                .dayTypeName(entity.getDayType().getName())
                .status(LeaveandOTStatus.valueOf(entity.getStatus()))
                .createdDateOT(entity.getCreatedDateOT())
                .approvedDateOT(entity.getApprovedDateOT())
                .note(entity.getNoteOT())
                .build();
    }

}
