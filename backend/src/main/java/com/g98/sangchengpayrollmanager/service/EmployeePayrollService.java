package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.payroll.response.EmployeePayrollRowDto;
import com.g98.sangchengpayrollmanager.model.entity.AttMonthSummary;
import com.g98.sangchengpayrollmanager.model.entity.PaySummary;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.AttMonthSummaryRepository;
import com.g98.sangchengpayrollmanager.repository.PaySummaryRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeePayrollService {
    private final UserRepository userRepo;
    private final AttMonthSummaryRepository attMonthRepo;
    private final PaySummaryRepository paySummaryRepo;

    public List<EmployeePayrollRowDto> getMyPayrollByYear(int year){
        // 1) Lấy username từ SecurityContext
        String username = AuthService.getCurrentUsername();

        User user = userRepo.findByUsernameWithRole(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));
        String employeeCode = user.getEmployeeCode();

        // 2) Khoảng thời gian trong năm đó
        Year y = Year.of(year);
        LocalDate start = y.atMonth(1).atDay(1);          // 2025-01-01
        LocalDate end   = y.atMonth(12).atEndOfMonth();   // 2025-12-31

        // 3) Lấy dữ liệu chấm công tháng
        List<AttMonthSummary> amsList =
                attMonthRepo.findByUserEmployeeCodeAndMonthBetween(employeeCode, start, end);// 2) Lấy employeeCode

        // 4) Lấy bảng lương đã chốt (status = 'confirmed')
        List<PaySummary> payList =
                paySummaryRepo.findByUserEmployeeCodeAndDateBetweenAndStatus(
                        employeeCode, start, end, "draft"
                );

        // Map pay_summary theo month
        Map<YearMonth, PaySummary> payMap = payList.stream()
                .collect(Collectors.toMap(
                        ps -> YearMonth.from(ps.getDate()),
                        ps -> ps
                ));
        // 5) Build DTO list
        List<EmployeePayrollRowDto> result = new ArrayList<>();

        for (AttMonthSummary ams : amsList) {
            YearMonth ym = YearMonth.from(ams.getMonth());
            PaySummary ps = payMap.get(ym);   // có thể null nếu chưa tính lương

            int netSalary = ps != null ? ps.getNetSalary() : 0;
            boolean hasPayslip = ps != null && ps.getPayslipUrl() != null;

            EmployeePayrollRowDto row = new EmployeePayrollRowDto(
                    ym.atDay(1),                         // month (FE tự format "MM-YYYY")
                    ams.getDayStandard().doubleValue(),  // Công chuẩn
                    ams.getDaysPayable().doubleValue(),  // Công thực tế
                    netSalary,
                    hasPayslip
            );
            result.add(row);
        }

        // sort tháng gần nhất lên trên
        result.sort(Comparator.comparing(EmployeePayrollRowDto::getMonth).reversed());

        return result;
    }
}
