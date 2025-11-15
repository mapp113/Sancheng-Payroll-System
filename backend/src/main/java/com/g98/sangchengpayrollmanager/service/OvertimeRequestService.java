package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OvertimeRequestService {

    // Nhân viên gửi đơn
    OvertimeRequestResponse submitOvertimeRequest(OvertimeRequestCreateDTO dto);

    // Nhân viên xem đơn của chính mình
    Page<OvertimeRequestResponse> getMyOvertimeRequest(Pageable pageable);

    // xóa đơn đang peniding
    void deleteOvertimeRequest(Integer overtimeRequestId);

    // xem chi tiết đơn
    OvertimeRequestResponse getOvertimeRequestDetail(Integer overtimeRequestId);

    // Lấy tất cả đơn cho HR xem
    Page<OvertimeRequestResponse> getAllOvertimeRequests(Integer month, Integer year, Pageable pageable);

    // Đồng ý đơn
    OvertimeRequestResponse approveOvertimeRequest(Integer overtimeRequestId, String note);

    // Từ chối đơn
    OvertimeRequestResponse rejectOvertimeRequest(Integer overtimeRequestId, String note);

    // Tìm kiếm đơn bằng mã nv
    Page<OvertimeRequestResponse> searchOvertimeRequests(String keyword, Pageable pageable);

    // tìm theo trạng thái
    Page<OvertimeRequestResponse> findByStatus(LeaveandOTStatus status, Pageable pageable);

    // Tính số OT còn lại trong tuần
    Integer getMyRemainingWeeklyOvertime();


}
