package com.g98.sangchengpayrollmanager.controller;


import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.LeaveandOTRequestUpdateDTO;
import com.g98.sangchengpayrollmanager.model.dto.leave.LeaveRequestResponse;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.enums.LeaveandOTStatus;
import com.g98.sangchengpayrollmanager.service.LeaveRequestService;
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


    // Submit
    @PostMapping(value = "/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<LeaveRequestResponse> submitLeaveRequest(@ModelAttribute  LeaveRequestCreateDTO requestDTO) {
        validator.validateLeaveRequest(requestDTO);
        Integer id = leaveRequestService.submitLeaveRequest(requestDTO).getId();
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(id).toUri();
        return ResponseEntity.created(location).build();
    }

    @GetMapping("/all") // Manager xem trang
    public ResponseEntity<Page<LeaveRequestResponse>> getAllLeaveRequests(@RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "20") int size,
                                                                          @RequestParam(defaultValue = "createdDate,desc") String sort
    ) {
        Pageable pageable = toPageable(page, size, sort);
        Page<LeaveRequestResponse> result = leaveRequestService.getAllLeaveRequests(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}")  // Employee xem trang
    public ResponseEntity<Page<LeaveRequestResponse>> getByUser(@PathVariable String employeeCode,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "20") int size,
                                                                @RequestParam(defaultValue = "createdDate,desc") String sort
    ) {
        Pageable pageable = toPageable(page, size, sort);
        Page<LeaveRequestResponse> result = leaveRequestService.findByUser_Id(employeeCode, pageable);
        return ResponseEntity.ok(result);
    }


    @GetMapping("/employee/{code}")
    public ResponseEntity<Page<LeaveRequestResponse>> getByEmployeeCode(
            @PathVariable("code") String employeeCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<LeaveRequestResponse> response = leaveRequestService.findByEmployeeCode(employeeCode, pageable);
        return ResponseEntity.ok(response);
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
