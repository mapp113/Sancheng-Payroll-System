package com.g98.sangchengpayrollmanager.model.dto;

import com.g98.sangchengpayrollmanager.model.dto.MonthlyOvertimeDTO;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OvertimeSummaryDTO {

    private Integer totalOvertime;
    private List<MonthlyOvertimeDTO> monthly;
}