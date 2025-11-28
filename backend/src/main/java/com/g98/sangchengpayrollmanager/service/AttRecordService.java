package com.g98.sangchengpayrollmanager.service;

import com.g98.sangchengpayrollmanager.model.dto.attendant.response.FirstCheckInResponse;
import com.g98.sangchengpayrollmanager.model.entity.AttRecord;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.repository.AttRecordRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttRecordService {

    private final AttRecordRepository attRecordRepository;
    private final UserRepository userRepository;

    public FirstCheckInResponse getFirstCheckInTime(String employeeCode, LocalDate date) {
        User user = userRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + employeeCode));

        List<AttRecord> records = attRecordRepository.findByUserIdAndDate(user.getUserId(), date);

        LocalTime firstTime = records.isEmpty()
                ? null
                : records.get(0).getCheckTime().toLocalTime();

        return new FirstCheckInResponse(employeeCode, date, firstTime);
    }

}