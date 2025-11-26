package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, String> {
    Optional<Contract> findFirstByUserEmployeeCodeOrderByStartDateDesc(String employeeCode);
}