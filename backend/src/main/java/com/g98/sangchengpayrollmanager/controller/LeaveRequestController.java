package com.g98.sangchengpayrollmanager.controller;


import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.LeaveTypeOptionDTO;
import com.g98.sangchengpayrollmanager.model.dto.LeaveandOTRequestUpdateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.service.LeaveRequestService;
import com.g98.sangchengpayrollmanager.service.LeaveTypeService;
import com.g98.sangchengpayrollmanager.service.validator.LeaveRequestValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final LeaveRequestValidator validator;
    private final LeaveTypeService leaveTypeService;

    @GetMapping("/options")
    public ResponseEntity<List<LeaveTypeOptionDTO>> getLeaveTypeOptions() {
        List<LeaveTypeOptionDTO> options = leaveTypeService.getAllOptions();
        return ResponseEntity.ok(options);
    }

    // Submit request của employee
    @PostMapping(value = "/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<LeaveRequestResponse> submitLeaveRequest(@ModelAttribute  LeaveRequestCreateDTO requestDTO) {

        validator.validateLeaveRequest(requestDTO);

        Integer id = leaveRequestService.submitLeaveRequest(requestDTO).getId();
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(id).toUri();
        return ResponseEntity.created(location).build();
    }

    // Lấy leave request cho anager xem
    @GetMapping("/all")
    public ResponseEntity<Page<LeaveRequestResponse>> getAllOrSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdDate,desc") String sort
    ) {
        Pageable pageable = toPageable(page, size, sort);

        Page<LeaveRequestResponse> result;

        if (keyword != null && !keyword.trim().isEmpty()) {
            result = leaveRequestService.searchLeaveRequests(keyword, pageable);
        }
        else {
            result = leaveRequestService.getAllLeaveRequests(month, year, pageable);
        }

        return ResponseEntity.ok(result);
    }


    // Lấy list leave request cho chính employee xem
    @GetMapping("/myrequest")
    public ResponseEntity<Page<LeaveRequestResponse>> getMyLeaveRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdDate,desc") String sort
    ) {
        Pageable pageable = toPageable(page, size, sort);
        Page<LeaveRequestResponse> result = leaveRequestService.getMyLeaveRequests(pageable);
        return ResponseEntity.ok(result);
    }

    // xem chi tiết yêu cầu ( của mình )
//    @GetMapping("/myrequest/{id}")
//    public ResponseEntity<LeaveRequestResponse> getMyLeaveRequestDetail(@PathVariable Integer id) {
//        LeaveRequestResponse response = leaveRequestService.getMyLeaveRequestDetail(id);
//        return ResponseEntity.ok(response);
//    }

    // xóa yêu cầu trước khi được duyệt
    @DeleteMapping("/myrequest/{id}")
    public ResponseEntity<?> deleteMyRequest(@PathVariable Integer id) {
        leaveRequestService.deleteMyLeaveRequest(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/employee/{code}")
    public ResponseEntity<Page<LeaveRequestResponse>> getByEmployeeCode(
            @PathVariable("code") String employeeCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveRequestResponse> response = leaveRequestService.searchLeaveRequests(employeeCode, pageable);
        return ResponseEntity.ok(response);
    }


    // Số ngày nghỉ còn lại của employee xem
    @GetMapping("/remainingLeave")
    public ResponseEntity<Double> getMyAnnualRemainingLeave() {
        return ResponseEntity.ok(leaveRequestService.getMyAnnualRemainingLeave());
    }


    @GetMapping("/status")
    public ResponseEntity<Page<LeaveRequestResponse>> getByStatus(@RequestParam String status,
                                                                  @RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "20") int size,
                                                                  @RequestParam(defaultValue = "createdDate,desc") String sort
    ) {
        String[] parts = sort.split(",");
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(parts[1].trim()), parts[0].trim())
        );
        LeaveandOTStatus st = LeaveandOTStatus.valueOf(status.trim().toUpperCase());
        Page<LeaveRequestResponse> result = leaveRequestService.findByStatus(st, pageable);
        return ResponseEntity.ok(result);
    }




        @GetMapping("/detail/{id}")
    public ResponseEntity<LeaveRequestResponse> getLeaveRequestDetail(@PathVariable Integer id) {
        LeaveRequestResponse response = leaveRequestService.getLeaveRequestDetail(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    @PutMapping("/approve/{id}")
    public ResponseEntity<LeaveRequestResponse> approveLeaveRequest
            (@PathVariable Integer id,
             @RequestBody @Validated LeaveandOTRequestUpdateDTO updateDTO) {
        leaveRequestService.approveLeaveRequest(id, updateDTO.getNote());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<LeaveRequestResponse> rejectLeaveRequest
            (@PathVariable Integer id,
             @RequestBody @Validated LeaveandOTRequestUpdateDTO updateDTO) {
        leaveRequestService.rejectLeaveRequest(id, updateDTO.getNote());
        return ResponseEntity.noContent().build();
    }


    private Pageable toPageable(Integer page, Integer size, String sort) {
        String[] parts = sort.split(",");
        String field = parts[0].trim();
        Sort.Direction dir = (parts.length > 1) ? Sort.Direction.fromString(parts[1]) : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(dir, field));
    }


}
