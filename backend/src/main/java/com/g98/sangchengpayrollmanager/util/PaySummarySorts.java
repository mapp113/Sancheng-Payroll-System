package com.g98.sangchengpayrollmanager.util;

import java.util.Map;

public final class PaySummarySorts {
    private PaySummarySorts() {}

    public static final Map<String, String> MAP = Map.of(
            "id", "si.user.employeeCode",
            "name", "si.user.fullName",
            "position", "p.name",
            "salary", "ps.netSalary",
            "status", "ps.status"
    );
}
