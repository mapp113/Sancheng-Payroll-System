package com.g98.sangchengpayrollmanager.controller;

import com.g98.sangchengpayrollmanager.model.dto.OT.OvertimeRequestResponse;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.service.OvertimeRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/overtime")
@RequiredArgsConstructor
public class OvertimeRequestController {

    private final OvertimeRequestService overtimeRequestService;

    // Nhân viên submit OT
    @PostMapping(value = "/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<OvertimeRequestResponse> submitOvertimeRequest(
            @ModelAttribute OvertimeRequestCreateDTO dto
    ) {
        return ResponseEntity.ok(overtimeRequestService.submitOvertimeRequest(dto));
    }


    // Nhân viên xem đơn của chính mình
    @GetMapping("/myrequest")
    public ResponseEntity<Page<OvertimeRequestResponse>> getMyOvertime(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "createdDateOT,DESC") String sort
    ) {
        Pageable pageable = toPageable(page, size, sort);
        return ResponseEntity.ok(overtimeRequestService.getMyOvertimeRequest(pageable));
    }


    // Nhân viên xóa đơn của chính mình
    @DeleteMapping("/myrequest/{id}")
    public ResponseEntity<Void> deleteMyOvertime(@PathVariable Integer id) {
        overtimeRequestService.deleteOvertimeRequest(id);
        return ResponseEntity.noContent().build();
    }

    // Nhân viên hoặc quản lý xem chi tiết đơn
    @GetMapping("detail/{id}")
    public ResponseEntity<OvertimeRequestResponse> getDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(overtimeRequestService.getOvertimeRequestDetail(id));
    }

    // Quản lý lấy tất cả các đơn
    @GetMapping("/all")
    public ResponseEntity<Page<OvertimeRequestResponse>> getAllOvertime(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(defaultValue = "createdDateOT,DESC") String sort
    ) {
        Pageable pageable = toPageable(page, size, sort);
        return ResponseEntity.ok(overtimeRequestService.getAllOvertimeRequests(month, year, pageable));
    }

    // Duyệt đơn xin overtime
    @PostMapping("/approve/{id}")
    public ResponseEntity<OvertimeRequestResponse> approveOvertimeRequest(
            @PathVariable Integer id,
            @RequestParam(required = false) String note
    ) {
        return ResponseEntity.ok(overtimeRequestService.approveOvertimeRequest(id, note));
    }

    // Reject đơn xin overtime
    @PostMapping("/reject/{id}")
    public ResponseEntity<OvertimeRequestResponse> rejectOvertimeRequest(
            @PathVariable Integer id,
            @RequestParam String note
    ) {
        return ResponseEntity.ok(overtimeRequestService.rejectOvertimeRequest(id, note));
    }



    @GetMapping("/status")
    public ResponseEntity<Page<OvertimeRequestResponse>> getByStatus( @RequestParam String status,
                                                                      @RequestParam(defaultValue = "0") Integer page,
                                                                      @RequestParam(defaultValue = "10") Integer size,
                                                                      @RequestParam(defaultValue = "createdDateOT,DESC") String sort
    ) {
        Pageable pageable = toPageable(page, size, sort);

        LeaveandOTStatus st = LeaveandOTStatus.valueOf(status.trim().toUpperCase());
        Page<OvertimeRequestResponse> result = overtimeRequestService.findByStatus(st, pageable);

        return ResponseEntity.ok(result);
    }

    // Xem số thời gian ot còn lại
    @GetMapping("/remaining-week")
    public ResponseEntity<Integer> getMyRemainingWeeklyOvertime() {
        return ResponseEntity.ok(overtimeRequestService.getMyRemainingWeeklyOvertime());
    }



    private Pageable toPageable(Integer page, Integer size, String sort) {
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDateOT"));
        }

        String[] parts = sort.split(",");
        String field = parts[0].trim();
        Sort.Direction dir = (parts.length > 1)
                ? Sort.Direction.fromString(parts[1])
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(dir, field));
    }

}
