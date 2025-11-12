package com.g98.sangchengpayrollmanager.repository;

import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {

    Page<LeaveRequest> findByStatus(LeaveandOTStatus status, Pageable pageable);

    Page<LeaveRequest> findByUser_EmployeeCode(String employeeCode, Pageable pageable);

}
