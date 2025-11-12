package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface LeaveRequestService {

    // Nhân viên gửi yêu cầu nghỉ
    LeaveRequestResponse submitLeaveRequest(LeaveRequestCreateDTO leaveRequest);

    // Lấy toàn bộ các yêu cầu cho HR
    Page<LeaveRequestResponse> getAllLeaveRequests(Pageable pageable);

    // Lấy toàn bộ yêu cầu theo user ( cho employee xem )
    Page<LeaveRequestResponse> findByUser_Id(Long userId, Pageable pageable);

    // Lấy toàn bộ các yêu cầu theo trạng thái
    Page<LeaveRequestResponse> findByStatus(LeaveandOTStatus status, Pageable pageable);


    //Lấy chi tiết yêu cầu
    LeaveRequestResponse getLeaveRequestDetail(Integer id);

    //HR duyệt yêu cầu
    LeaveRequestResponse approveLeaveRequest(Integer id, String note);

    // HR từ chối yêu cầu
    LeaveRequestResponse rejectLeaveRequest(Integer id, String note);
}
