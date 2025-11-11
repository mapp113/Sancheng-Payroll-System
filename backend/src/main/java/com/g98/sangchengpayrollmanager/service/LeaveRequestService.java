package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;

import java.util.List;


public interface LeaveRequestService {

    // Nhân viên gửi yêu cầu nghỉ
    LeaveRequestResponse submitLeaveRequest(LeaveRequestCreateDTO leaveRequest);

    // Lấy toàn bộ các yêu cầu cho HR
    List<LeaveRequestResponse> getAllLeaveRequests();

    // Lấy toàn bộ các yêu cầu đang chờ
    List<LeaveRequestResponse> getPendingLeaveRequests();

    //Lấy chi tiết yêu cầu
    LeaveRequestResponse getLeaveRequestDetail(Integer id);

    //HR duyệt yêu cầu
    LeaveRequestResponse approveLeaveRequest(Integer id, String note);

    // HR từ chối yêu cầu
    LeaveRequestResponse rejectLeaveRequest(Integer id, String note);
}
