package com.g98.sangchengpayrollmanager.repository;


import com.g98.sangchengpayrollmanager.model.entity.LeaveQuota;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaveQuotaRepository extends JpaRepository<LeaveQuota, Long> {

    Optional<LeaveQuota> findByEmployeeCodeAndLeaveTypeCodeAndYear(
            String employeeCode, String leaveType, Integer year);

}
