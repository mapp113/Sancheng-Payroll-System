package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.dto.attendant.response.TimeSheetResponse;
import com.g98.sangchengpayrollmanager.model.dto.payroll.response.PaySummaryResponse;
import com.g98.sangchengpayrollmanager.model.entity.AttMonthSummary;
import com.g98.sangchengpayrollmanager.model.entity.PaySummary;
import com.g98.sangchengpayrollmanager.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttMonthSummaryRepository extends JpaRepository<AttMonthSummary,Integer> {
    AttMonthSummary findByUserEmployeeCodeAndMonth(String employeeCode, LocalDate month);
    Optional<AttMonthSummary> findByUserAndMonth(User user, LocalDate month);
    @Query(
            value = """
            Select new com.g98.sangchengpayrollmanager.model.dto.attendant.response.TimeSheetResponse(
                ams.user.employeeCode,
                ams.user.fullName,
                ei.position.name,
                ams.daysHours,
                ams.otHours,
                ams.usedleave
            )
            FROM AttMonthSummary ams ,EmployeeInformation ei 
            WHERE ams.user.employeeCode = ei.user.employeeCode
            And ams.month = :date
            AND (
                        LOWER(ams.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(ams.user.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(ei.position.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR CAST(ams.daysHours AS string) LIKE CONCAT('%', :keyword, '%')
                        OR CAST(ams.otHours AS string) LIKE CONCAT('%', :keyword, '%')
                    )
""",
            countQuery = """
            SELECT COUNT(ams)
            FROM AttMonthSummary ams ,EmployeeInformation ei 
            WHERE ams.user.employeeCode = ei.user.employeeCode
            And ams.month = :date
            AND (
                        LOWER(ams.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(ams.user.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(ei.position.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR CAST(ams.daysHours AS string) LIKE CONCAT('%', :keyword, '%')
                        OR CAST(ams.otHours AS string) LIKE CONCAT('%', :keyword, '%')
                    )
        """
    )
    Page<TimeSheetResponse> findTimeSheetByMonth(@Param("date") LocalDate date, @Param("keyword") String keyword, Pageable pageable);
    List<AttMonthSummary> findByUserEmployeeCodeAndMonthBetween(
            String employeeCode,
            LocalDate start,
            LocalDate end
    );
}
