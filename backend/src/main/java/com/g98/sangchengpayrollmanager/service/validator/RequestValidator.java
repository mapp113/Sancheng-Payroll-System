package com.g98.sangchengpayrollmanager.service.validator;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.dto.OvertimeRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static io.micrometer.common.util.StringUtils.isBlank;

@Component
@RequiredArgsConstructor
public class RequestValidator {

    private final LeaveTypeRepository leaveTypeRepository;

    public record ValidatedLeaveInputs(
            LeaveType leaveType,
            DurationType durationType
    ) {
    }

    public ValidatedLeaveInputs validateLeaveRequest(LeaveRequestCreateDTO dto) {
        //Null
        if (dto.getFromDate() == null) throw new IllegalArgumentException("fromDate là bắt buộc");
        if (isBlank(dto.getDuration())) throw new IllegalArgumentException("duration là bắt buộc");
        if (isBlank(dto.getLeaveType())) throw new IllegalArgumentException("leaveType là bắt buộc");
        if (isBlank(dto.getReason())) throw new IllegalArgumentException("reason là bắt buộc");

        if (dto.getReason().length() > 255) {
            throw new IllegalArgumentException("reason tối đa 255 ký tự");
        }
        //  Parse enum duration + quy tắc theo duration
        LocalDate from = dto.getFromDate();
        LocalDate to = (dto.getToDate() != null) ? dto.getToDate() : from;

        DurationType durationType;
        try {
            durationType = DurationType.valueOf(dto.getDuration().trim().toUpperCase());
        } catch (Exception ex) {
            throw new IllegalArgumentException("duration không hợp lệ (FULL_DAY, HALF_DAY_AM, HALF_DAY_PM)");
        }

        LeaveType leaveType = leaveTypeRepository.findByCodeIgnoreCase(dto.getLeaveType())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại nghỉ: " + dto.getLeaveType()));

        return new ValidatedLeaveInputs(leaveType, durationType);
    }

    public LocalDate validateOvertime(OvertimeRequestCreateDTO overtimeRequestDTO) {

        LocalDate otDate = (overtimeRequestDTO.getOtDate() != null)
                ? overtimeRequestDTO.getOtDate() : LocalDate.now(); // default nếu null

        LocalDateTime fromTime = overtimeRequestDTO.getFromTime();
        LocalDateTime toTime = overtimeRequestDTO.getToTime();

        if (fromTime == null || toTime == null) {
            throw new IllegalArgumentException("Thiếu thông tin ngày/giờ OT");
        }

        if (!fromTime.toLocalDate().equals(otDate) ||
                !toTime.toLocalDate().equals(otDate)) {
            throw new IllegalArgumentException("OT phải nằm trong cùng một ngày");
        }

        if (!toTime.isAfter(fromTime)) {
            throw new IllegalArgumentException("Giờ kết thúc phải lớn hơn giờ bắt đầu");
        }

        return otDate;
    }
}


