package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.*;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.repository.*;
import com.g98.sangchengpayrollmanager.security.ConfirmException;
import com.g98.sangchengpayrollmanager.service.AttDailySummaryService;
import com.g98.sangchengpayrollmanager.service.AttMonthSummaryService;
import com.g98.sangchengpayrollmanager.service.NotificationService;
import com.g98.sangchengpayrollmanager.service.OvertimeRequestService;
import com.g98.sangchengpayrollmanager.service.validator.RequestValidator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final NotificationService notificationService;
    private final AttDailySummaryService attDailySummaryService;
    private final AttMonthSummaryService attMonthSummaryService;

    @Override
    public OvertimeRequestResponse submitOvertimeRequest(OvertimeRequestCreateDTO overtimeRequestDTO) {

        String username = getCurrentUsername();
        User user = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        LocalDate otDate = requestValidator.validateOvertime(overtimeRequestDTO);

        DayType dayType = resolveDayType(otDate);

        long workedHours = Duration.between(
                overtimeRequestDTO.getFromTime(),
                overtimeRequestDTO.getToTime()
        ).toHours();

        LocalDate monthStart = otDate.withDayOfMonth(1);
        LocalDate monthEnd   = otDate.withDayOfMonth(otDate.lengthOfMonth());

        boolean hasOverlap = overtimeRequestRespository.existsOverlappingRequest(
                user.getEmployeeCode(),
                otDate,
                overtimeRequestDTO.getFromTime(),
                overtimeRequestDTO.getToTime()
        );

        if (hasOverlap) {
            throw new IllegalArgumentException(
                    "Khoảng thời gian OT này bị trùng với đơn OT khác trong cùng ngày."
            );
        }

        // tổng số giờ OT trong tháng hiện tại
        int monthlyHours = overtimeRequestRespository.sumWorkedHoursInMonth(
                user.getEmployeeCode(), monthStart, monthEnd
        );

        int monthlyAfter = monthlyHours + (int) workedHours;

        LocalDate yearStart = LocalDate.of(otDate.getYear(), 1, 1);
        LocalDate yearEnd   = LocalDate.of(otDate.getYear(), 12, 31);
        int yearlyHours = overtimeRequestRespository.sumWorkedHoursInYear(
                user.getEmployeeCode(), yearStart, yearEnd
        );

        // tổng số giờ OT trong năm hiện tại
        int yearlyAfter = yearlyHours + (int) workedHours;

        boolean overMonthly = monthlyAfter > 40;
        boolean overYearly  = yearlyAfter > 200;

        if ((overMonthly || overYearly)
                && (overtimeRequestDTO.getConfirmOverLimit() == null
                || !overtimeRequestDTO.getConfirmOverLimit())) {

            StringBuilder msg = new StringBuilder();
            if (overMonthly) {
                msg.append("Tổng số giờ OT trong tháng ")
                        .append(otDate.getMonthValue()).append("/").append(otDate.getYear())
                        .append(" sau khi thêm đơn này là ").append(monthlyAfter)
                        .append(" giờ (vượt 40 giờ/tháng).\n");
            }
            if (overYearly) {
                msg.append("Tổng số giờ OT trong năm ")
                        .append(otDate.getYear())
                        .append(" sau khi thêm đơn này là ").append(yearlyAfter)
                        .append(" giờ (vượt 200 giờ/năm).\n");
            }
            msg.append("Bạn có chắc chắn muốn tiếp tục gửi đơn OT này không?");

            Map<String, Object> payload = new HashMap<>();
            payload.put("monthlyAfter", monthlyAfter);
            payload.put("yearlyAfter", yearlyAfter);

            throw new ConfirmException("OT_OVER_LIMIT", msg.toString(), payload);
        }

        OvertimeRequest entity = mapToEntity(overtimeRequestDTO, user, otDate, dayType, (int) workedHours);
        OvertimeRequest savedOvertimeRequest = overtimeRequestRespository.save(entity);

        List<User> managers  = userRepository.findAllManagers();

        for (User u : managers) {
            notificationService.createNotification(
                    u.getEmployeeCode(),
                    "Có đơn Làm thêm giờ mới ",
                    user.getFullName() + " gửi đơn Làm thêm giờ ngày " + otDate,
                    "OT_REQUEST",
                    savedOvertimeRequest.getId()
            );
        }

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

        if (!overtimeRequest.getUser().getEmployeeCode().equals(user.getEmployeeCode())) {
            throw new RuntimeException("Chỉ được xóa đơn của mình");
        }
        if (!LeaveandOTStatus.PENDING.name().equals(overtimeRequest.getStatus())) {
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

        if (!isManager && !overtimeRequest.getUser().getEmployeeCode().equals(user.getEmployeeCode())) {
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
        String username = getCurrentUsername();
        User approver = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại : " + username));

        String roleName = approver.getRole().getName();
        if ("HR".equals(roleName)) {
            throw new RuntimeException("HR chỉ được xem, không được từ chối đơn overtime.");
        }
        if (!"Manager".equals(roleName)) {
            throw new RuntimeException("Chỉ Manager mới được từ chối đơn overtime.");
        }

        OvertimeRequest overtimeRequest = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu overtime ko tồn tại"));

        if (overtimeRequest.getUser().getEmployeeCode().equals(approver.getEmployeeCode())) {
            throw new RuntimeException("Manager không được tự từ chối overtime của chính mình.");
        }

        if (!LeaveandOTStatus.PENDING.name().equals(overtimeRequest.getStatus())) {
            throw new IllegalStateException("Chỉ duyệt đơn OT ở trạng thái PENDING");
        }

        overtimeRequest.setStatus(LeaveandOTStatus.APPROVED.name());
        overtimeRequest.setApprovedDateOT(LocalDateTime.now());
        overtimeRequest.setNoteOT(note);

        OvertimeRequest savedOvertimeRequest = overtimeRequestRespository.save(overtimeRequest);
        int workHours = (overtimeRequest.getWorkedTime() == null) ? 0 : overtimeRequest.getWorkedTime();

        if (workHours > 0) {
            upsertMonthlyOvertimeBalance(overtimeRequest.getUser(), overtimeRequest.getOtDate(), workHours);
        }

        changeOvertimetoLeaveWithMonthlyOverLimit(overtimeRequest.getUser(), overtimeRequest.getOtDate());

        // Đơn được duyệt sau và tính lại công ngày OT
        LocalDate otDate = overtimeRequest.getOtDate();
        LocalDate today = LocalDate.now();

        if (otDate.isBefore(today)) {
            String empCode = overtimeRequest.getUser().getEmployeeCode();

            // Tính lại công ngày OT (vì là 1 ngày duy nhất)
            attDailySummaryService.createDailySummary(empCode, otDate);

            // Tính lại công tháng chứa ngày OT
            YearMonth thisMonth = YearMonth.from(today);
            YearMonth otMonth = YearMonth.from(otDate);

            LocalDate recalculateMonthDate = !thisMonth.equals(otMonth)
                    ? otDate.withDayOfMonth(otDate.lengthOfMonth())   // tháng cũ -> cuối tháng đó
                    : otDate;                                         // tháng hiện tại -> tính tới ngày OT

            attMonthSummaryService.createMonthSummary(empCode, recalculateMonthDate);
        }

        User employee = overtimeRequest.getUser();
        notificationService.createNotification(
                employee.getEmployeeCode(),
                "Đơn xin làm thêm giờ của bạn đã được duyệt ",
                " Đơn làm thêm giờ ngày " + overtimeRequest.getOtDate() +" Đã được duyệt bởi Manager.",
                "OT_APPROVED",
                savedOvertimeRequest.getId());
        return mapToResponse(savedOvertimeRequest);
    }

    @Override
    public OvertimeRequestResponse rejectOvertimeRequest(Integer overtimeRequestId, String note) {
        String username = getCurrentUsername();
        User approver = userRepository.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Người không tồn tại : " + username));

        String roleName = approver.getRole().getName();
        if ("HR".equals(roleName)) {
            throw new RuntimeException("HR chỉ được xem, không được từ chối đơn overtime.");
        }
        if (!"Manager".equals(roleName)) {
            throw new RuntimeException("Chỉ Manager mới được từ chối đơn overtime.");
        }

        OvertimeRequest overtimeRequest = overtimeRequestRespository.findById(overtimeRequestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu overtime ko tồn tại"));

        if (overtimeRequest.getUser().getEmployeeCode().equals(approver.getEmployeeCode())) {
            throw new RuntimeException("Manager không được tự từ chối overtime của chính mình.");
        }

        if (!LeaveandOTStatus.PENDING.name().equals(overtimeRequest.getStatus())) {
            throw new IllegalStateException("Chỉ duyệt đơn overtime ở trạng thái PENDING");
        }

        overtimeRequest.setStatus(LeaveandOTStatus.REJECTED.name());
        overtimeRequest.setApprovedDateOT(LocalDateTime.now());
        overtimeRequest.setNoteOT(note);
        OvertimeRequest saveOvertimeRequest = overtimeRequestRespository.save(overtimeRequest);

        User employee = overtimeRequest.getUser();
        notificationService.createNotification(
                employee.getEmployeeCode(),
                "Đơn xin làm thêm giờ của bạn đã không được duyệt ",
                " Đơn làm thêm giờ ngày " + overtimeRequest.getOtDate() +" Đã không được duyệt bởi Manager.",
                "OT_APPROVED",
                saveOvertimeRequest.getId());

        return mapToResponse(saveOvertimeRequest);

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

        int monthlyHours = overtimeRequestRespository.sumApprovedWorkedHoursInMonth(
                user.getEmployeeCode(), monthStart, monthEnd
        );

        return monthlyHours;
    }

    // Cái này đang dùng bảng carried_over để lưu số gi dư
    public void changeOvertimetoLeaveWithMonthlyOverLimit(User user, LocalDate otDate) {
        String empCode = user.getEmployeeCode();
        int year = otDate.getYear();
        int month = otDate.getMonthValue();

        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = otDate.withDayOfMonth(otDate.lengthOfMonth());

        int monthlyHours = overtimeRequestRespository.sumApprovedWorkedHoursInMonth(
                user.getEmployeeCode(), monthStart, monthEnd
        );

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

        // Tạo / lấy loại nghỉ bù OT
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

        LeaveQuota quota = leaveQuotaRepository
                .findByEmployeeCodeAndLeaveTypeCodeAndYear(empCode, compType.getCode(), year)
                .orElseGet(() -> {
                    LeaveQuota q = new LeaveQuota();
                    q.setEmployeeCode(empCode);
                    q.setLeaveTypeCode("OT_COMP");
                    q.setLeaveType(compType);
                    q.setYear(year); // dùng đúng năm OT
                    q.setEntitledDays(0.000);
                    q.setCarriedOver(0.000);
                    q.setUsedDays(0.000);
                    return q;
                });

        double entitledDaysFromExcess = excessHours / 8.0;
        quota.setEntitledDays(entitledDaysFromExcess);
        leaveQuotaRepository.save(quota);
    }


    // tạo overtime_balance mới cho tuần đó
    private void upsertMonthlyOvertimeBalance(User user, LocalDate otDate, int workedHours) {
        int year  = otDate.getYear();
        int month = otDate.getMonthValue();

        OvertimeBalance balance = overtimeBalanceRepository
                .findByUserEmployeeCodeAndYearAndMonth(user.getEmployeeCode(), year, month)
                .orElseGet(() -> OvertimeBalance.builder()
                        .user(user)
                        .year(year)
                        .month(month)
                        .hourBalance(0)
                        .build()
                );

        int currentWorkedHours = (balance.getHourBalance() == null) ? 0 : balance.getHourBalance();
        balance.setHourBalance(currentWorkedHours + workedHours);

        overtimeBalanceRepository.save(balance);
    }

    // check khi tạo phiếu lương cho 1 nhân viên
    public void validateNoPendingOvertime(String employeeCode, YearMonth yearMonth) {
        LocalDate fromDate = yearMonth.atDay(1);
        LocalDate toDate   = yearMonth.atEndOfMonth();

        boolean hasPending = overtimeRequestRespository
                .existsByEmployeeAndOtDateRangeAndStatus(employeeCode, fromDate, toDate, LeaveandOTStatus.PENDING.name());

        if (hasPending) {
            throw new RuntimeException("Không thể tạo phiếu lương vì còn đơn OT đang chờ duyệt trong tháng "
                    + yearMonth.getMonthValue() + "/" + yearMonth.getYear());
        }
    }

    // check khi tạo phiếu lương cho toàn bộ nhân viên
    private void validateNoPendingOvertimeCompanyWide(YearMonth yearMonth) {
        LocalDate fromDate = yearMonth.atDay(1);
        LocalDate toDate   = yearMonth.atEndOfMonth();

        boolean hasPending = overtimeRequestRespository
                .existsAnyInDateRangeWithStatus(fromDate, toDate, LeaveandOTStatus.PENDING.name());

        if (hasPending) {
            throw new RuntimeException("Không thể chốt lương vì còn đơn OT đang chờ duyệt trong tháng "
                    + yearMonth.getMonthValue() + "/" + yearMonth.getYear());
        }
    }

    private int calcIntRemainingFromQuota(LeaveQuota quota) {
        double entitledDaysRaw = quota.getEntitledDays();
        double usedRaw = quota.getUsedDays();

        int entitledInt = (int) Math.floor(entitledDaysRaw) ;
        int usedInt = (int) Math.floor(usedRaw) ;

        return Math.max(entitledInt - usedInt,0);
    }

    // xác định dạng ngày overtime
    private DayType resolveDayType(LocalDate otDate) {

        if (specialDaysRepository.existsByDate(otDate)) {
            return dayTypeRepository.findByNameIgnoreCase("Holiday")
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngày lễ "));
        }

        var dow = otDate.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return dayTypeRepository.findByNameIgnoreCase("Weekend")
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngày "));
        }

        return dayTypeRepository.findByNameIgnoreCase("Working Day")
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ngày "));
    }

    // xác định ngươời gửi đơn
    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Không có người dùng.");
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
                .status(LeaveandOTStatus.valueOf(entity.getStatus()))
                .createdDateOT(entity.getCreatedDateOT())
                .approvedDateOT(entity.getApprovedDateOT())
                .note(entity.getNoteOT())
                .build();
    }

}
