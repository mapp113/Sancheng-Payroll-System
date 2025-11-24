package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.OvertimeBalance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OvertimeBalanceRepository extends JpaRepository<OvertimeBalance, Integer> {
    Optional<OvertimeBalance> findByUserEmployeeCodeAndYearAndMonth(String employeeCode,
                                                                    Integer year,
                                                                    Integer month);
}
