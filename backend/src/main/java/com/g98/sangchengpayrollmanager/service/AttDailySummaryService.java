package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.attendant.request.AttDailySummaryUpdateRequest;
import com.g98.sangchengpayrollmanager.model.dto.attendant.response.AttDailySummaryResponse;
import com.g98.sangchengpayrollmanager.model.entity.*;
import com.g98.sangchengpayrollmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttDailySummaryService {

    private final AttDailySummaryRepository attDailySummaryRepo;
    private final AttPolicyRepository attPolicyRepo;
    private final AttScheduleRepository attScheduleRepo;
    private final UserRepository userRepo;
    private final SpecialDaysRepository specialDaysRepo;
    private final DayTypeRepository dayTypeRepo;
    private final LeaveRequestRepository leaveRequestRepo;
    private final AttRecordRepository attRecordRepo;
    private final OvertimeRequestRespository overtimeRequestRespo;
    private final AttMonthSummaryService attMonthSummaryService;


    @Transactional
    public AttDailySummary createDailySummary(String employeeCode, LocalDate date) {
        User user = userRepo.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new IllegalStateException("User not found: " + employeeCode));

        // 1. Nếu đã tồn tại daily summary => báo lỗi và dừng=================================================
        attDailySummaryRepo.findByUserAndDate(user, date)
                .ifPresent(ds -> {
                    throw new IllegalStateException(
                            "Daily summary for " + employeeCode + " on " + date + " already exists."
                    );
                });

        AttDailySummary dailySummary = new AttDailySummary();

        // 2. Lấy policy mặc định (ALL)=================================================================
        AttPolicy policy = attPolicyRepo.findFirstByApplyScopeOrderByIdAsc("ALL")
                .orElseThrow(() -> new IllegalStateException("No default ATT policy configured"));

        // 3. Tìm schedule + shift cho ngày đó (nếu có)===================================================
        String dayOfWeek = date.getDayOfWeek().name(); // MONDAY, TUESDAY, ...
        AttSchedule schedule = attScheduleRepo
                .findFirstByUserAndDayOfWeekAndStatus(user, dayOfWeek, "ACTIVE")
                .orElse(null);

        Shift shift = schedule != null ? schedule.getShift() : null;
        LocalDateTime shiftStart = null;
        LocalDateTime shiftEnd = null;
        int breakMinutes = 0;
        if (shift != null && shift.getStartTime() != null && shift.getEndTime() != null) {
            shiftStart = LocalDateTime.of(date, shift.getStartTime());
            shiftEnd = LocalDateTime.of(date, shift.getEndTime());
            breakMinutes = shift.getBreakMinutes() != null ? shift.getBreakMinutes() : 0;
        }

        // 4. Xác định day_type
        SpecialDays specialDay = specialDaysRepo.findByDate(date).orElse(null);
        DayType dayType;
        if (specialDay != null) {
            // Ngày đặc biệt: dùng dayType của specialDay
            dayType = specialDay.getDayType();
        } else {
            // Không phải ngày đặc biệt: phân loại theo weekday / weekend
            boolean isWeekend = date.getDayOfWeek().getValue() >= 6; // 6 = SAT, 7 = SUN
            String dayTypeName = isWeekend ? "Weekend" : "Working Day"; // đúng như data trong DB

            dayType = dayTypeRepo.findByName(dayTypeName)
                    .orElseThrow(() -> new IllegalStateException("DayType not configured: " + dayTypeName));
        }


        // 5. Lấy đơn nghỉ đã duyệt trong ngày (nếu có)
        LeaveRequest leaveRequest = leaveRequestRepo.findByUserAndDateAndStatus(user, date, "APPROVED")
                                                    .orElse(null);
        String leaveTypeCode = null;
        //neu da xin va duoc cho nghi
        if(leaveRequest != null) {
            leaveTypeCode = leaveRequest.getLeaveType().getCode();
            dailySummary.setUser(user);
            dailySummary.setDate(date);
            dailySummary.setWorkHours(0);
            dailySummary.setOtHour(0);
            dailySummary.setDayType(dayType);
            dailySummary.setIsDayMeal(false);
            dailySummary.setIsTrialDay(false);
            dailySummary.setCheckInTime(null);
            dailySummary.setCheckOutTime(null);
            dailySummary.setLateMinutes(0);
            dailySummary.setIsLateCounted(false);
            dailySummary.setEarlyLeaveMinutes(0);
            dailySummary.setIsEarlyLeaveCounted(false);
            dailySummary.setLeaveTypeCode(leaveTypeCode);
            dailySummary.setIsAbsent(false);

            // neu la nghi co luong
            if(leaveRequest.getIsPaidLeave()){
                dailySummary.setWorkHours(policy.getStandardHoursPerDay());
                dailySummary.setIsPayableDay(true);
                dailySummary.setIsCountPayableDay(true);
                return attDailySummaryRepo.save(dailySummary);
            }

            dailySummary.setIsPayableDay(false);
            dailySummary.setIsCountPayableDay(false);
            return attDailySummaryRepo.save(dailySummary);
        }

        // 6. Lấy record chấm công trong ngày
        List<AttRecord> records = attRecordRepo.findByUserIdAndDate(user.getUserId(), date);

        // 7. Xử lý OT request trong ngày (nếu có)
        List<OvertimeRequest> otRequests = overtimeRequestRespo
                .findByUserAndDateAndStatus(user, date, "APPROVED");
        Integer otHour = 0;


        // 8. Xác định có record chấm công không
        LocalDateTime checkInTime = null;
        LocalDateTime checkOutTime = null;
        Integer workHours = 0;
        Integer lateMinutes = 0;
        Integer earlyLeaveMinutes = 0;
        Boolean isLateCounted = false;
        Boolean isEarlyLeaveCounted = false;
        Boolean isDayMeal = false;
        Boolean isPayableDay = false;
        Boolean isCountPayableDay = false;
        Boolean isAbsent = false;

        if(schedule == null && otRequests.isEmpty() && specialDay == null) {
            //ngày nghỉ bình thuong: không có schedule, không có ot request, không phải special day(nghỉ lễ có lương)
            throw new IllegalStateException(
                    "No working/OT/special info for " + employeeCode + " on " + date + " (normal off day)"
            );
        }

        if(!records.isEmpty()) {
            // Có chấm công
            checkInTime = records.get(0).getCheckTime();
            checkOutTime = records.get(records.size() - 1).getCheckTime();
            System.out.println("checkInTime: " + checkInTime);
            System.out.println("checkOutTime: " + checkOutTime);
            if (checkOutTime != null && checkInTime != null) {
                LocalDateTime checkInTime1 = checkInTime;
                LocalDateTime checkOutTime1 = checkOutTime;
                if (shiftStart != null && shiftEnd != null) {
                    //khi có shift
                    if(checkInTime.isBefore(shiftStart)) checkInTime1 = shiftStart;
                    if(checkOutTime.isAfter(shiftEnd)) checkOutTime1 = shiftEnd;
                }
                Integer workMinutes = (int) Duration.between(checkInTime1, checkOutTime1).toMinutes() - breakMinutes;
                if (workMinutes > 0) workHours = workMinutes / 60;
                // 🔹 CHỈ cap khi có schedule (ngày làm việc bình thường)
                if (schedule != null && workHours >= policy.getStandardHoursPerDay()) {
                    workHours = policy.getStandardHoursPerDay();
                }

                // không phải ngày công chuẩn và đăng ký OT → tính OT theo chấm công
                if (schedule == null && !otRequests.isEmpty()) {

                    LocalDateTime firstFrom = otRequests.get(0).getFromTime();
                    LocalDateTime lastTo = otRequests.get(otRequests.size() - 1).getToTime();

                    // OT bắt đầu = max(checkIn, fromTime)
                    LocalDateTime otCheckInTime =
                            checkInTime.isAfter(firstFrom) ? checkInTime : firstFrom;

                    // OT kết thúc = min(checkOut, toTime)
                    LocalDateTime otCheckOutTime =
                            checkOutTime.isBefore(lastTo) ? checkOutTime : lastTo;

                    int otMinutes = 0;
                    if (otCheckOutTime.isAfter(otCheckInTime)) {
                        otMinutes = (int) Duration.between(otCheckInTime, otCheckOutTime).toMinutes();
                    }

                    otHour = otMinutes > 0 ? (otMinutes / 60) : 0;
                    workHours = 0;
                }

                // nếu là ngày công chuẩn và có đăng ký OT, tính OT theo dữ liệu chấm công
                if (schedule != null && !otRequests.isEmpty() && shiftEnd != null) {

                    // Lấy from/to tổng: request đầu tiên và cuối cùng trong ngày
                    LocalDateTime firstFrom = otRequests.get(0).getFromTime();
                    LocalDateTime lastTo = otRequests.get(otRequests.size() - 1).getToTime();

                    // OT chỉ tính sau khi hết giờ làm chuẩn
                    LocalDateTime otCheckInTime = firstFrom.isAfter(shiftEnd) ? firstFrom : shiftEnd;

                    // OT không được vượt quá thời gian chấm công thực tế
                    LocalDateTime otCheckOutTime = lastTo.isBefore(checkOutTime) ? lastTo : checkOutTime;

                    int otMinutes = 0;
                    if (otCheckOutTime.isAfter(otCheckInTime)) {
                        otMinutes = (int) Duration.between(otCheckInTime, otCheckOutTime).toMinutes();
                    }

                    otHour = otMinutes > 0 ? otMinutes / 60 : 0;
                }
            }
            // Tính đi muộn / về sớm nếu có shift
            if (shiftStart != null && shiftEnd != null) {
                if (checkInTime.isAfter(shiftStart)) {
                    System.out.println("shiftStart: " + shiftStart);
                    lateMinutes = (int) Duration.between(shiftStart, checkInTime).toMinutes();
                }
                if (checkOutTime.isBefore(shiftEnd)) {
                    earlyLeaveMinutes = (int) Duration.between(checkOutTime, shiftEnd).toMinutes();
                }
            }
            // Áp policy cho late / early
            if (lateMinutes > policy.getLateGraceMinutes()) {
                isLateCounted = true;
            } else {
                lateMinutes = 0;
            }
            if (earlyLeaveMinutes > policy.getEarlyGraceMinutes()) {
                isEarlyLeaveCounted = true;
            } else {
                earlyLeaveMinutes = 0;
            }

            // Quyết định có được tính full luong ngày theo late/early
            if(!isLateCounted && !isEarlyLeaveCounted && workHours >= policy.getMinHoursForFullDay()) {
                isPayableDay = true;
            }

            // Quyết định co tính công cơm
            if(workHours >= policy.getMinHoursForMeal()){
                isDayMeal = true;
            }

            //Quyết định có tính ngày công thực te
            if(workHours >= policy.getMinHoursForPayable()){
                isCountPayableDay = true;
            }

        } else {
            // không co du lieu cham cong
            if(specialDay != null) {
                // ngay dac biet: nghỉ lễ co lương
                isPayableDay = true;
                isCountPayableDay = true;
            }
            if (specialDay == null && schedule != null) {
                // co lich lam viec va khong phải là ngày đac biet
                isAbsent = true;
            }

            if(!otRequests.isEmpty()) {
                // co request ot nhung khong co du lieu cham cong
                otHour = 0;
            }
        }

        // 9. Trial day: tạm chưa xu ly de la false
        Boolean isTrialDay = false;

        // Nếu là ngày lễ → luôn tính công, bất kể record hay giờ giấc
        if (specialDay != null) {
            isCountPayableDay = true;
        }


        // 10. Khoi tao daily summary
        dailySummary.setUser(user);
        dailySummary.setDate(date);
        dailySummary.setWorkHours(workHours);
        dailySummary.setOtHour(otHour);
        dailySummary.setIsDayMeal(isDayMeal);
        dailySummary.setIsTrialDay(isTrialDay);
        dailySummary.setIsPayableDay(isPayableDay);
        dailySummary.setIsCountPayableDay(isCountPayableDay);
        dailySummary.setDayType(dayType);
        dailySummary.setCheckInTime(checkInTime);
        dailySummary.setCheckOutTime(checkOutTime);
        dailySummary.setLateMinutes(lateMinutes);
        dailySummary.setIsLateCounted(isLateCounted);
        dailySummary.setEarlyLeaveMinutes(earlyLeaveMinutes);
        dailySummary.setIsEarlyLeaveCounted(isEarlyLeaveCounted);
        dailySummary.setLeaveTypeCode(leaveTypeCode);
        dailySummary.setIsAbsent(isAbsent);

        return attDailySummaryRepo.save(dailySummary);
    }

    public List<AttDailySummaryResponse> getByEmployeeAndMonth(String employeeCode, LocalDate month) {
        YearMonth ym = YearMonth.from(month);
        LocalDate start = ym.atDay(1);
        LocalDate end   = ym.atEndOfMonth();

        List<AttDailySummary> entities =
                attDailySummaryRepo.findByUserEmployeeCodeAndDateBetween(employeeCode, start, end);

        return entities.stream().map(e -> {
            AttDailySummaryResponse dto = new AttDailySummaryResponse();
            dto.setId(e.getId());
            dto.setDate(e.getDate());
            dto.setDayTypeName(e.getDayType().getName());
            dto.setWorkHours(e.getWorkHours());
            dto.setOtHour(e.getOtHour());
            dto.setIsLateCounted(e.getIsLateCounted());
            dto.setIsEarlyLeaveCounted(e.getIsEarlyLeaveCounted());
            dto.setIsCountPayableDay(e.getIsCountPayableDay());
            dto.setIsAbsent(e.getIsAbsent());
            dto.setIsDayMeal(e.getIsDayMeal());
            dto.setIsTrialDay(e.getIsTrialDay());
            dto.setLeaveTypeCode(e.getLeaveTypeCode());
            dto.setCheckInTime(e.getCheckInTime());
            dto.setCheckOutTime(e.getCheckOutTime());
            // nếu có join dayType thì set thêm dayTypeName
            return dto;
        }).toList();
    }

    @PreAuthorize("hasRole('HR')")
    @Transactional
    public void updateDailySummary(Integer id, AttDailySummaryUpdateRequest req) {
        AttDailySummary entity = attDailySummaryRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Daily summary not found: " + id));

        if (req.getIsLateCounted() != null && req.getIsLateCounted()) {
            entity.setIsLateCounted(false);
        }
        if (req.getIsEarlyLeaveCounted() != null && req.getIsEarlyLeaveCounted()) {
            entity.setIsEarlyLeaveCounted(false);
        }
        if (req.getIsDayMeal() != null) {
            entity.setIsDayMeal(req.getIsDayMeal());
        }

        // ✔️ Save daily summary để đảm bảo dữ liệu mới được flush vào database
        attDailySummaryRepo.save(entity);
        //update lại monthSummary
        attMonthSummaryService.createMonthSummary(entity.getUser().getEmployeeCode(), entity.getDate());
    }
}
