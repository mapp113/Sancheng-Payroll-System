package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.PayComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PayComponentRepository extends JpaRepository<PayComponent, Integer> {
    @Query("""
            SELECT pc FROM PayComponent pc
            WHERE pc.user.employeeCode = :employeeCode
              AND pc.startDate <= :periodEnd
              AND (pc.endDate IS NULL OR pc.endDate >= :periodStart)
            """)
    List<PayComponent> findActive(
            @Param("employeeCode") String employeeCode,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd
    );

    List<PayComponent> findByUserEmployeeCodeOrderByStartDateDesc(String employeeCode);

    @Query("SELECT pc FROM PayComponent pc " +
            "WHERE pc.user.employeeCode = :employeeCode " +
            "AND pc.startDate <= :endOfMonth " +
            "AND (pc.endDate IS NULL OR pc.endDate >= :startOfMonth) " +
            "ORDER BY pc.startDate DESC")
    List<PayComponent> findByUserEmployeeCodeAndMonth(
            @Param("employeeCode") String employeeCode,
            @Param("startOfMonth") LocalDate startOfMonth,
            @Param("endOfMonth") LocalDate endOfMonth
    );

}
