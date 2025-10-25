package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.PayComponent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface PayComponentRepository extends JpaRepository<PayComponent,Integer> {
//    int sumAllowances(String employeeCode,LocalDate month);
//    int sumDeductions(String employeeCode,LocalDate month);
}
