package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.LeaveBalance;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaveBalanceRepository  extends JpaRepository<LeaveBalance, Long> {
    Optional<LeaveBalance> findByUserAndLeaveTypeAndYear(User user, LeaveType leaveType, int year);

    Optional<LeaveBalance> findByEmployeeCode(String employeeCode);
}
