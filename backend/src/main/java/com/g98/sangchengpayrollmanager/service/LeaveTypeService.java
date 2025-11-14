package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.LeaveTypeOptionDTO;

import java.util.List;

public interface LeaveTypeService {

    List<LeaveTypeOptionDTO> getAllOptions();
}
