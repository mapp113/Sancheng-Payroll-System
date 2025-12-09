package com.g98.sangchengpayrollmanager.model.enums;

public enum PaySummaryStatus {
    DRAFT,          // Mới tạo, chưa duyệt
    APPROVED;       // Đã duyệt

    public static PaySummaryStatus fromString(String value) {
        for (PaySummaryStatus s : values()) {
            if (s.name().equalsIgnoreCase(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Invalid PaySummaryStatus: " + value);
    }
}

