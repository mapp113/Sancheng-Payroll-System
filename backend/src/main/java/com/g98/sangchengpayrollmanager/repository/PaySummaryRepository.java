package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.dto.payroll.response.PaySummaryResponse;
import com.g98.sangchengpayrollmanager.model.entity.PaySummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaySummaryRepository extends JpaRepository<PaySummary,Integer> {

    @Query(
            value = """
            SELECT new com.g98.sangchengpayrollmanager.model.dto.payroll.response.PaySummaryResponse(
                si.user.employeeCode,
                si.user.fullName,
                p.name,
                ps.netSalary,
                ps.status,
                ps.payslipUrl
            )
            FROM PaySummary ps
            JOIN SalaryInformation si ON ps.salaryInformation.id = si.id
            JOIN EmployeeInformation ei ON si.user.employeeCode = ei.user.employeeCode
            JOIN Position p ON ei.position.id = p.id
            WHERE ps.date = :date
            AND (
                        LOWER(si.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(si.user.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR CAST(ps.netSalary AS string) LIKE CONCAT('%', :keyword, '%')
                        OR LOWER(ps.status) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    )
        """,
            countQuery = """
            SELECT COUNT(ps)
            FROM PaySummary ps
            JOIN SalaryInformation si ON ps.salaryInformation.id = si.id
            JOIN EmployeeInformation ei ON si.user.employeeCode = ei.user.employeeCode
            JOIN Position p ON ei.position.id = p.id
            WHERE ps.date = :date
            AND (
                        LOWER(si.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(si.user.employeeCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                        OR CAST(ps.netSalary AS string) LIKE CONCAT('%', :keyword, '%')
                        OR LOWER(ps.status) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    )
        """
    )
    Page<PaySummaryResponse> findSummariesByDate(@Param("date") LocalDate date, @Param("keyword") String keyword, Pageable pageable);

    // tìm paysummary draft của 1 nhân viên trong 1 tháng
    Optional<PaySummary> findByUserEmployeeCodeAndDateAndStatus(String employeeCode,
                                                                LocalDate date,
                                                                String status);

    // tìm paysummaryDetail 1 nhân viên trong 1 tháng
    @Query("""
        select ps from PaySummary ps
        left join fetch ps.components c
        where ps.user.employeeCode = :employeeCode
          and ps.date = :month
    """)
    Optional<PaySummary> findWithComponentsByEmployeeAndMonth(@Param("employeeCode") String employeeCode,
                                                              @Param("month") LocalDate month);
}
