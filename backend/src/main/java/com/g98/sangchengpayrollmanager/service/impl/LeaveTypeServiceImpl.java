package com.g98.sangchengpayrollmanager.service.impl;

import com.g98.sangchengpayrollmanager.model.dto.LeaveTypeOptionDTO;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.service.LeaveTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveTypeServiceImpl implements LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    @Override
    public List<LeaveTypeOptionDTO> getAllOptions() {
        return leaveTypeRepository.findAll()
                .stream()
                .map(lt -> new LeaveTypeOptionDTO(lt.getCode(), lt.getName()))
                .toList();
    }
}
