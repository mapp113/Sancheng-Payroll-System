package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SalaryInformationRepository extends JpaRepository<SalaryInformation, Integer> {
    @Query("""
                SELECT s FROM SalaryInformation s
                WHERE s.user.employeeCode = :employeeCode
                  AND (
                        (s.effectiveTo >= :monthStart AND s.effectiveTo <= :monthEnd)
                        OR (s.effectiveTo is null AND s.effectiveFrom <= :monthEnd)
                      )
            """)
    List<SalaryInformation> findActiveByEmployeeCode(@Param("employeeCode") String employeeCode, @Param("monthStart") LocalDate monthStart, @Param("monthEnd") LocalDate monthEnd);

    List<SalaryInformation> findByUserEmployeeCodeOrderByEffectiveFromDesc(String employeeCode);

    boolean existsByUserEmployeeCode(String employeeCode);

}
