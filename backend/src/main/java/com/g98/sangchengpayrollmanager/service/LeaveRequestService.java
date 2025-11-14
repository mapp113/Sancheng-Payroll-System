package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



public interface LeaveRequestService {

    // Nhân viên gửi yêu cầu nghỉ
    LeaveRequestResponse submitLeaveRequest(LeaveRequestCreateDTO leaveRequest);

    // Lấy toàn bộ yêu cầu theo user ( cho employee xem )
    Page<LeaveRequestResponse> getMyLeaveRequests(Pageable pageable);

    // Lay chi tiết các yêu cầu của nhân viên đó
    // LeaveRequestResponse getMyLeaveRequestDetail(Integer id);

    // Lấy toàn bộ các yêu cầu theo trạng thái
    Page<LeaveRequestResponse> findByStatus(LeaveandOTStatus status, Pageable pageable);

    // Search theo mã  nhân viên
    Page<LeaveRequestResponse> searchLeaveRequests(String keyword, Pageable pageable);

    // kiểm tra số ngày nghỉ còn lai
    double getMyAnnualRemainingLeave();

    // Xóa đơn xin nghỉ chưa được duyệt
    void deleteMyLeaveRequest(Integer id);

    // Lấy yêu cầu cho Manager xem
    Page<LeaveRequestResponse> getAllLeaveRequests(Integer month, Integer year, Pageable pageable);

    //Lấy chi tiết yêu cầu
    LeaveRequestResponse getLeaveRequestDetail(Integer id);

    //Manager duyệt yêu cầu
    LeaveRequestResponse approveLeaveRequest(Integer id, String note);

    // Manager từ chối yêu cầu
    LeaveRequestResponse rejectLeaveRequest(Integer id, String note);
}
