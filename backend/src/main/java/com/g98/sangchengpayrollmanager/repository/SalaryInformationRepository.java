package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.SalaryInformation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalaryInformationRepository extends JpaRepository<SalaryInformation,Integer> {
    // SalaryInformation findActiveByEmployeeCode(String employeeCode);
}
