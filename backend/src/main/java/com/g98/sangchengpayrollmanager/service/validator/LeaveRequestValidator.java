package com.g98.sangchengpayrollmanager.service.validator;

import com.g98.sangchengpayrollmanager.model.dto.LeaveRequestCreateDTO;
import com.g98.sangchengpayrollmanager.model.entity.LeaveType;
import com.g98.sangchengpayrollmanager.model.entity.User;
import com.g98.sangchengpayrollmanager.model.enums.DurationType;
import com.g98.sangchengpayrollmanager.repository.LeaveQuotaRepository;
import com.g98.sangchengpayrollmanager.repository.LeaveTypeRepository;
import com.g98.sangchengpayrollmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class LeaveRequestValidator {

    private final UserRepository userRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveQuotaRepository leaveQuotaRepository;

    public record ValidatedLeaveInputs(
            LeaveType leaveType,
            DurationType durationType
    ) {}

    public ValidatedLeaveInputs validateLeaveRequest(LeaveRequestCreateDTO dto) {
        //Null
        if (dto.getFromDate() == null) throw new IllegalArgumentException("fromDate là bắt buộc");
        if (dto.getToDate() == null) throw new IllegalArgumentException("toDate là bắt buộc");
        if (isBlank(dto.getDuration())) throw new IllegalArgumentException("duration là bắt buộc");
        if (isBlank(dto.getLeaveType())) throw new IllegalArgumentException("leaveType là bắt buộc");
        if (isBlank(dto.getReason())) throw new IllegalArgumentException("reason là bắt buộc");

        // 2) Định dạng & quy tắc đơn giản
        if (dto.getReason().length() > 255) {
            throw new IllegalArgumentException("reason tối đa 255 ký tự");
        }

        //  Parse enum duration + quy tắc theo duration
        final DurationType durationType;
        try {
            durationType = DurationType.valueOf(dto.getDuration());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("duration không hợp lệ. Giá trị hợp lệ: FULL_DAY, HALF_DAY_AM, HALF_DAY_PM");
        }

        LocalDate from = dto.getFromDate();
        LocalDate to   = dto.getToDate();
        if (to.isBefore(from)) throw new IllegalArgumentException("toDate phải >= fromDate");

//        if ((durationType == DurationType.HALF_DAY_AM || durationType == DurationType.HALF_DAY_PM)
//                && !from.equals(to)) {
//            throw new IllegalArgumentException("Nghỉ nửa ngày yêu cầu fromDate = toDate");
//        }

    //     if (from.isBefore(LocalDate.now())) throw new IllegalArgumentException("Không thể tạo đơn cho ngày đã qua");


        LeaveType leaveType = leaveTypeRepository.findByCodeIgnoreCase(dto.getLeaveType())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại nghỉ: " + dto.getLeaveType()));

        // Ràng buộc business “paid/unpaid”
        //  Muốn cho phép client chọn isPaidLeave thì bật check này:
        // Boolean requestedPaid = dto.isPaidLeave();
        // if (requestedPaid && Boolean.FALSE.equals(leaveType.getIsPaid())) {
        //     throw new IllegalArgumentException("Loại nghỉ này là không lương, không thể chọn paidLeave=true");
        // }

        return new ValidatedLeaveInputs( leaveType, durationType);
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
