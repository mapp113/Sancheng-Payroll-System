package com.g98.sangchengpayrollmanager.controller;


import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.LeaveandOTRequestUpdateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;


    // Submit
    @PostMapping("/submit")
    public ResponseEntity<LeaveRequestResponse> submitLeaveRequest(@RequestBody LeaveRequestCreateDTO requestDTO) {
        LeaveRequestResponse response = leaveRequestService.submitLeaveRequest(requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<LeaveRequestResponse>> getAllLeaveRequests() {
        List<LeaveRequestResponse> responseList = leaveRequestService.getAllLeaveRequests();
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/all/{staus}")
    public ResponseEntity<List<LeaveRequestResponse>> getAllPendingLeaveRequests() {
        List<LeaveRequestResponse> responseList = leaveRequestService.getPendingLeaveRequests();
        return ResponseEntity.ok(responseList);
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
        LeaveRequestResponse response = leaveRequestService.approveLeaveRequest(id, updateDTO.getNote());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<LeaveRequestResponse> rejectLeaveRequest
            (@PathVariable Integer id,
             @RequestBody @Validated LeaveandOTRequestUpdateDTO updateDTO) {
        LeaveRequestResponse response = leaveRequestService.rejectLeaveRequest(id, updateDTO.getNote());
        return ResponseEntity.ok(response);
    }


}
