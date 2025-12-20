import type {ManagerTimesheetDetailData} from "../types";

export const managerTimesheetDetail: ManagerTimesheetDetailData = {
    dashboardTitle: "Manager Dashboard",
    title: "Chi tiết bảng chấm công",
    tabs: [{label: "Thành phần lương"}, {label: "Thông tin chi tiết", isActive: true}],
    // ✅ ngày động
    startDate: "2025-09-15",
    endDate: "2025-10-15",

    employee: {
        name: "Do Van B",
        position: "Manager",
        department: "Operations",
        employeeId: "EMP-0925",
        avatarUrl: "/icons/employee.png",
    },

    summaryMetrics: [
        {label: "Total Hours", value: 163, unit: "hrs", iconSrc: "/icons/attendance.png"},
        {label: "Work Hours", value: 147, unit: "hrs"},
        {label: "Overtime Hours", value: 16, unit: "hrs"},
    ],

    generalInformation: [
        {label: "Employee ID", value: "EMP-0925"},
        {label: "Department", value: "Operations"},
        {label: "Line Manager", value: "Nguyen Van A"},
        {label: "Location", value: "Ho Chi Minh City"},
    ],

    leaveSummary: {takenDays: 5, remainingDays: 7},

    entries: [
        {id: "2025-09-15", day: "Mon", date: "15/09/2025", checkIn: 8, checkOut: 17, workHours: 8, overtimeHours: 2},
        {id: "2025-09-16", day: "Tue", date: "16/09/2025", checkIn: 8, checkOut: 17, workHours: 8, overtimeHours: null},
        {id: "2025-09-17", day: "Wed", date: "17/09/2025", checkIn: 8, checkOut: 17, workHours: 8, overtimeHours: null},
        {id: "2025-09-18", day: "Thu", date: "18/09/2025", type: "leave", note: "Sick Leave"},
        {
            id: "2025-09-19",
            day: "Fri",
            date: "19/09/2025",
            checkIn: 9,
            checkOut: 18,
            workHours: 7.5,
            overtimeHours: 1.5
        },
        {
            id: "2025-09-20",
            day: "Sat",
            date: "20/09/2025",
            checkIn: 10,
            checkOut: 17,
            workHours: 6,
            overtimeHours: null
        },
        {id: "2025-09-21", day: "Sun", date: "21/09/2025", type: "leave", note: "Day Off"},
        {id: "2025-09-22", day: "Mon", date: "22/09/2025", checkIn: 8, checkOut: 17, workHours: 8, overtimeHours: null},
    ],

    otherEntries: [
        {type: "Bonus", description: "Bonus 1", amount: "500k", startedOn: "17 Jun 2021"},
        {type: "Bonus", description: "Bonus 2", amount: "500k", startedOn: "17 Jun 2021"},
        {type: "Allowance", description: "Allowance 1", amount: "500k", startedOn: "17 Jun 2021"},
        {type: "Allowance", description: "Allowance 2", amount: "500k", startedOn: "17 Jun 2021"},
    ],
};