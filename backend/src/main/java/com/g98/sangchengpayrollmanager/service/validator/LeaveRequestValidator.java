package com.g98.sangchengpayrollmanager.service.validator;


import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.LeaveRequest;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
    public class LeaveRequestValidator {
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveRequestValidator(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public void validateLeaveRequest(LeaveRequestCreateDTO dto) {
         if (dto == null) throw new IllegalArgumentException("LeaveRequestCreateDTO is null");
         if (dto.getEmployeeCode()  == null ||dto.getEmployeeCode().isBlank())
             throw new IllegalArgumentException("employeeCode is required");
         if (dto.getLeaveType() == null || dto.getLeaveType().isBlank())
             throw new IllegalArgumentException("leaveTypeId is required");
         if (dto.getFromDate() == null) throw new IllegalArgumentException("fromDate is required");
         if (dto.getToDate() == null) throw new IllegalArgumentException("toDate is required");
         if (dto.getDuration() == null || dto.getDuration().isBlank())
             throw new IllegalArgumentException("duration is required");

         DurationType duration = DurationType.valueOf(dto.getLeaveType());
         validateDates(dto.getFromDate(), dto.getToDate(), duration);

         LeaveType leaveType = leaveTypeRepository.findByCode(dto.getLeaveType())
                 .orElseThrow(() -> new IllegalArgumentException("LeaveType not found"));

         if(Boolean.FALSE.equals(leaveType.getIsPaid())){
             throw new IllegalArgumentException("LeaveType is not paid");
         }

         if (Boolean.FALSE.equals(leaveType.getIsCountedAsLeave()))
             throw new IllegalArgumentException("LeaveType is not counted as leave");
     }

    private void validateDates(LocalDate fromDate, LocalDate toDate, DurationType duration) {
         if (toDate.isBefore(fromDate)) {
             throw new IllegalArgumentException("fromDate is after toDate");
         }
         if (duration == DurationType.HALF_DAY_AM || DurationType.HALF_DAY_PM == duration
                 && !fromDate.equals(toDate)) {
             throw new IllegalArgumentException("fromDate is == toDate");

         }
    }


}
