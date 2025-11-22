package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.attendant.response.AttMonthSummaryResponse;
import com.g98.sangchengpayrollmanager.model.dto.attendant.response.TimeSheetResponse;
import com.g98.sangchengpayrollmanager.model.entity.AttDailySummary;
import com.g98.sangchengpayrollmanager.model.entity.AttMonthSummary;
import com.g98.sangchengpayrollmanager.model.entity.AttPolicy;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.AttDailySummaryRepository;
import com.g98.sangchengpayrollmanager.repository.AttMonthSummaryRepository;
import com.g98.sangchengpayrollmanager.repository.AttPolicyRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttMonthSummaryService {
    private final AttMonthSummaryRepository attMonthRepo;
    private final UserRepository userRepo;
    private final AttDailySummaryRepository attDailySummaryRepo;
    private final AttPolicyRepository attPolicyRepo;

    public Page<TimeSheetResponse> getTimeSheetByMonth(LocalDate date, String keyword, String sortBy, String sortDir, int page, int size){
        String searchValue = (keyword == null || keyword.isBlank()) ? "" : keyword.trim();
//        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
//        String sortField = (sortBy == null || sortBy.isBlank()) ? "employeeCode" : sortBy;
        Pageable pageable = PageRequest.of(page, size);
        return attMonthRepo.findTimeSheetByMonth(date, searchValue, pageable);
    }

    @Transactional
    public AttMonthSummary createMonthSummary(String employeeCode, LocalDate date) {
        User user = userRepo.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new IllegalStateException("User not found: " + employeeCode));
        // Lấy ngày đầu tháng
        LocalDate monthStart = date.withDayOfMonth(1);

        // Lấy policy mặc định (ALL)=================================================================
        AttPolicy policy = attPolicyRepo.findFirstByApplyScopeOrderByIdAsc("ALL")
                .orElseThrow(() -> new IllegalStateException("No default ATT policy configured"));

        // 1) Tìm month summary đã có cho user + tháng đó
        Optional<AttMonthSummary> optional = attMonthRepo.findByUserAndMonth(user, monthStart);

        AttMonthSummary monthSummary;

        if (date.getDayOfMonth() == 1) {
            // Ngày đầu tháng → tạo mới
            if (optional.isPresent()) {
                throw new IllegalStateException("Month summary for " + employeeCode + " at " + monthStart + " already exists");
            }

            monthSummary = new AttMonthSummary();
            monthSummary.setUser(user);
            monthSummary.setMonth(monthStart);

        } else {
            // Không phải ngày 1:
            // - Nếu đã có thì lấy ra để update
            // - Nếu chưa có thì cũng tạo mới luôn
            if (optional.isPresent()) {
                monthSummary = optional.get();
            } else {
                monthSummary = new AttMonthSummary();
                monthSummary.setUser(user);
                monthSummary.setMonth(monthStart);
            }
        }

        // 3) Lấy toàn bộ Daily Summary của tháng
        LocalDate toDate = date; // hoặc full tháng tùy bạn
        List<AttDailySummary> dailyList = attDailySummaryRepo
                .findByUserEmployeeCodeAndDateBetween(employeeCode, monthStart, toDate);

        // 4) Tính các chỉ số tháng
        int otHours = 0;
        int daysHours = 0;
        int usedLeave = 0;
        int lateCount = 0;
        int earlyLeaveCount = 0;
        java.math.BigDecimal daysMeal = java.math.BigDecimal.ZERO;
        java.math.BigDecimal daysTrial = java.math.BigDecimal.ZERO;
        java.math.BigDecimal daysPayable = java.math.BigDecimal.ZERO;

        for (AttDailySummary ds : dailyList) {
            if (ds.getOtHour() != null) otHours += ds.getOtHour();
            if (ds.getWorkHours() != null) daysHours += ds.getWorkHours();

            if ("annual".equalsIgnoreCase(ds.getLeaveTypeCode())) {
                usedLeave += 1; // nếu sau này có half-day thì điều chỉnh
            }
            if (Boolean.TRUE.equals(ds.getIsDayMeal())) daysMeal = daysMeal.add(java.math.BigDecimal.ONE);
            if (Boolean.TRUE.equals(ds.getIsTrialDay())) daysTrial = daysTrial.add(java.math.BigDecimal.ONE);
            if (Boolean.TRUE.equals(ds.getIsCountPayableDay())) daysPayable = daysPayable.add(java.math.BigDecimal.ONE);
            if (Boolean.TRUE.equals(ds.getIsLateCounted())) lateCount++;
            if (Boolean.TRUE.equals(ds.getIsEarlyLeaveCounted())) earlyLeaveCount++;
        }

        // 5) Tính số ngày làm việc chuẩn trong tháng
        int workingDaysInMonth = 0;
        LocalDate cursor = monthStart;
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

        while (!cursor.isAfter(monthEnd)) {
            switch (cursor.getDayOfWeek()) {
                case SATURDAY, SUNDAY -> { /* nghỉ */ }
                default -> workingDaysInMonth++;
            }
            cursor = cursor.plusDays(1);
        }

        // 6) Gán dữ liệu vào AttMonthSummary
        monthSummary.setDayStandard(java.math.BigDecimal.valueOf(workingDaysInMonth));
        monthSummary.setDaysMeal(daysMeal);
        monthSummary.setDaysTrial(daysTrial);
        monthSummary.setDaysPayable(daysPayable);
        monthSummary.setOtHours(otHours);
        monthSummary.setDaysHours(daysHours);
        monthSummary.setUsedleave(usedLeave);
        monthSummary.setStandardHoursPerDay(java.math.BigDecimal.valueOf(policy.getStandardHoursPerDay()));
        monthSummary.setLateCount(lateCount);
        monthSummary.setEarlyLeaveCount(earlyLeaveCount);

        return attMonthRepo.save(monthSummary);
    }

    public AttMonthSummaryResponse getAttMonthByEmployeeAndMonth(LocalDate month, String employeeCode) {
        Optional<User> user = userRepo.findByEmployeeCode(employeeCode);
        if (user.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }
        Optional<AttMonthSummary> monthSummary = attMonthRepo.findByUserAndMonth(user.get(), month);
        if (monthSummary.isEmpty()) {
            throw new IllegalArgumentException("Month summary not found");
        }

        AttMonthSummaryResponse response = new AttMonthSummaryResponse(
                user.get().getEmployeeCode(),
                user.get().getFullName(),
                monthSummary.get().getDaysHours(),
                monthSummary.get().getOtHours(),
                monthSummary.get().getUsedleave(),
                monthSummary.get().getDayStandard(),
                monthSummary.get().getDaysMeal(),
                monthSummary.get().getDaysTrial(),
                monthSummary.get().getDaysPayable(),
                monthSummary.get().getLateCount(),
                monthSummary.get().getEarlyLeaveCount()
        );
        return response;
    }
}
