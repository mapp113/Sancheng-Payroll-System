package com.g98.sangchengpayrollmanager.repository;


import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.OvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
    public interface OvertimeRequestRespository extends JpaRepository<OvertimeRequest, Integer> {

        Optional<OvertimeRequestResponse> findOvertimeRequestById(Integer overtimeRequestId);
        List<OvertimeRequest> findByStatus(String status);
}
