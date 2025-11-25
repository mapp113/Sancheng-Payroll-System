package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.OvertimeBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OvertimeBalanceRepository extends JpaRepository<OvertimeBalance, Integer> {
    Optional<OvertimeBalance> findByUserEmployeeCodeAndYearAndMonth(String employeeCode,
                                                                    Integer year,
                                                                    Integer month);

    @Query("""
        SELECT COALESCE(SUM(b.hourBalance), 0)
        FROM OvertimeBalance b
        WHERE b.user.employeeCode = :employeeCode
          AND b.year = :year
    """)
    Integer sumYearlyBalance(@Param("employeeCode") String employeeCode,
                             @Param("year") Integer year);

    @Query("""
        SELECT b.month, COALESCE(SUM(b.hourBalance), 0)
        FROM OvertimeBalance b
        WHERE b.user.employeeCode = :employeeCode
          AND b.year = :year
        GROUP BY b.month
        ORDER BY b.month
    """)
    List<Object[]> sumMonthlyBalance(@Param("employeeCode") String employeeCode,
                                     @Param("year") Integer year);
}
