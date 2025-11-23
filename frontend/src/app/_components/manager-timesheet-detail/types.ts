export interface TimesheetSummaryMetric {
    label: string;
    value: number;
    unit?: string;
    iconSrc?: string;
}

export interface TimesheetGeneralInfoItem {
    label: string;
    value: string;
}

export interface TimesheetEntry {
    id: string;
    day: string;
    date: string;
    checkIn?: number | string | null;
    checkOut?: number | string | null;
    workHours?: number | null;
    overtimeHours?: number | null;
    note?: string;
    type?: "work" | "leave";
}

export interface TimesheetLeaveSummary {
    takenDays: number;
    remainingDays: number;
}

export interface TimesheetToolbarTab {
    label: string;
    href?: string;
    isActive?: boolean;
}

export interface TimesheetOtherEntry {
    type: string;
    description: string;
    amount: string;
    startedOn: string;
}

export interface ManagerTimesheetDetailData {
    dashboardTitle: string;
    title: string;
    tabs: TimesheetToolbarTab[];
    // ✅ thay periodLabel bằng 2 field dưới
    startDate: string; // ISO: "YYYY-MM-DD"
    endDate: string;   // ISO: "YYYY-MM-DD"
    employee: {
        name: string;
        position: string;
        department?: string;
        employeeId?: string;
        avatarUrl?: string;
    };
    summaryMetrics: TimesheetSummaryMetric[];
    generalInformation: TimesheetGeneralInfoItem[];
    leaveSummary: TimesheetLeaveSummary;
    entries: TimesheetEntry[];
    otherEntries?: TimesheetOtherEntry[];
}

export interface ManagerTimeSheetDetailParam {
    employeeCode: string;
    month: string; // "YYYY-MM"
};

export interface EmployeeInfomation {
    employeeCode: string,
    fullName: string,
    positionName: string,
}

export interface AttendanceSummary {
    usedleave: number;
    dayStandard: number;
    daysMeal: number;
    lateCount: number;
    earlyLeaveCount: number;
    daysHours: number;
    otHours: number;
}

export interface AttendanceDaily {
    id:number;
    date: string;
    dayTypeName: string;
    workHours: number;
    otHour: number;
    isLateCounted: boolean;
    isEarlyLeaveCounted: boolean;
    isCountPayableDay: boolean;
    isAbsent: boolean;
    isDayMeal: boolean;
    isTrialDay: boolean;
    leaveTypeCode: string | null;
    checkInTime: string;
    checkOutTime: string;
}

export interface AttDailySummaryUpdateRequest {
    isLateCounted: boolean;
    isEarlyLeaveCounted: boolean;
    isDayMeal: boolean;
}
