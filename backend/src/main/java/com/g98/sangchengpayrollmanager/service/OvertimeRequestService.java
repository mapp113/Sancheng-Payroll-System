package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.OvertimeRequest;
import com.g98.sangchengpayrollmanager.repository.OvertimeRequestRespository;

import java.util.List;

public interface OvertimeRequestService {

    OvertimeRequestResponse submitOvertimeRequest(OvertimeRequestCreateDTO dto);
    List<OvertimeRequestResponse> getAllOvertimeRequests();
    List<OvertimeRequestResponse> getPendingOvertimeRequests();
    OvertimeRequestResponse approveOvertimeRequest(Integer overtimeRequestId, String note);
    OvertimeRequestResponse rejectOvertimeRequest(Integer overtimeRequestId, String note);
}
