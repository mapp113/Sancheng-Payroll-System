"use client";

import {
    DetailHeader,
    type DetailHeaderLine,
    DetailShell,
    DetailSummaryCard,
} from "@/app/_components/detail";

import type {
    ManagerTimesheetDetailData,
    TimesheetEntry,
    TimesheetOtherEntry,
    EmployeeInfomation,
    AttendanceSummary,
    AttendanceDaily,
    AttDailySummaryUpdateRequest,
} from "./types";
import { formatDecimal, formatHours, formatTime } from "./utils";
import { useState, useEffect, useContext } from "react";
import { TimesheetDetailParam } from "./context";
import FormPopBoxNotScroll from "../common/pop-box/form-not-scroll";

interface ManagerTimesheetDetailProps {
    detail: ManagerTimesheetDetailData;
    view?: "timesheet" | "other";
}

export default function ManagerTimesheetDetail({
    detail,
    view = "timesheet",
}: ManagerTimesheetDetailProps) {
    // ✅ giữ state ngày, khởi tạo từ data
    const [startDate, setStartDate] = useState(detail.startDate);
    const [endDate, setEndDate] = useState(detail.endDate);
    const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfomation | null>(null);
    const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
    const [attendanceDaily, setAttendanceDaily] = useState<AttendanceDaily[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<AttendanceDaily | null>(null);
    const timesheetParams = useContext(TimesheetDetailParam);

    // Gọi API để lấy thông tin nhân viên
    useEffect(() => {
        const fetchEmployeeInfo = async () => {
            if (!timesheetParams?.employeeCode) return;

            setIsLoading(true);
            try {
                const response = await fetch(
                    `http://localhost:8080/api/employees/${timesheetParams.employeeCode}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch employee information');
                }

                const data: EmployeeInfomation = await response.json();
                setEmployeeInfo(data);
            } catch (error) {
                console.error('Error fetching employee info:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployeeInfo();
    }, [timesheetParams?.employeeCode]);

    // Gọi API để lấy attendance summary
    useEffect(() => {
        const fetchAttendanceSummary = async () => {
            if (!timesheetParams?.employeeCode || !timesheetParams?.month) return;
            
            setIsLoading(true);
            try {
                // Thêm "-01" vào month để tạo định dạng YYYY-MM-DD
                const monthParam = `${timesheetParams.month}-01`;
                const response = await fetch(
                    `http://localhost:8080/api/attsummary/month?month=${monthParam}&employeeCode=${timesheetParams.employeeCode}`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch attendance summary');
                }
                
                const data: AttendanceSummary = await response.json();
                setAttendanceSummary(data);
            } catch (error) {
                console.error('Error fetching attendance summary:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceSummary();
    }, [timesheetParams?.employeeCode, timesheetParams?.month]);

    // Gọi API để lấy attendance daily
    useEffect(() => {
        const fetchAttendanceDaily = async () => {
            if (!timesheetParams?.employeeCode || !timesheetParams?.month) return;
            
            setIsLoading(true);
            try {
                // Thêm "-01" vào month để tạo định dạng YYYY-MM-DD
                const monthParam = `${timesheetParams.month}-01`;
                const response = await fetch(
                    `http://localhost:8080/api/attsummary/by-month?employeeCode=${timesheetParams.employeeCode}&month=${monthParam}`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch attendance daily');
                }
                
                const data: AttendanceDaily[] = await response.json();
                setAttendanceDaily(data);
            } catch (error) {
                console.error('Error fetching attendance daily:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendanceDaily();
    }, [timesheetParams?.employeeCode, timesheetParams?.month]);

    const headerLines: DetailHeaderLine[] = [];
    if (employeeInfo?.employeeCode || detail.employee.employeeId) {
        headerLines.push({ text: employeeInfo?.employeeCode || detail.employee.employeeId || "", variant: "accent" });
    }

    const summaryMetrics = [
        {
            label: "Tổng giờ",
            value: attendanceSummary ? (attendanceSummary.daysHours + attendanceSummary.otHours) : (detail.summaryMetrics[0]?.value || 0),
            unit: "giờ",
            iconSrc: "/icons/attendance.png"
        },
        {
            label: "Giờ làm việc",
            value: attendanceSummary?.daysHours ?? (detail.summaryMetrics[1]?.value || 0),
            unit: "giờ"
        },
        {
            label: "Giờ tăng ca",
            value: attendanceSummary?.otHours ?? (detail.summaryMetrics[2]?.value || 0),
            unit: "giờ"
        }
    ];

    const header = (
        <DetailHeader
            badgeLabel={detail.title}
            title={employeeInfo?.fullName || detail.employee.name}
            subtitle={employeeInfo?.positionName || detail.employee.position}
            lines={headerLines}
            avatarName={employeeInfo?.fullName || detail.employee.name}
            avatarUrl={detail.employee.avatarUrl}
            summary={summaryMetrics.map((metric) => (
                <DetailSummaryCard
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    iconSrc={metric.iconSrc}
                    unit={metric.unit}
                    formatValue={formatDecimal}
                />
            ))}
            summaryContainerClassName="grid w-full gap-3 sm:grid-cols-3 md:w-auto"
        />
    );

    if (view === "other") {
        return (
            <DetailShell>
                {header}
                <div className="space-y-6 p-6">
                    <OtherPeriodCard
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(s, e) => {
                            setStartDate(s);
                            setEndDate(e);
                        }}
                    />
                    <OtherEntriesTable entries={detail.otherEntries} />
                </div>
            </DetailShell>
        );
    }

    return (
        <DetailShell>
            {header}

            <div className="grid gap-6 p-6 xl:grid-cols-[320px_1fr]">
                <div className="space-y-6">
                    <LeaveSummaryCard
                        month={startDate}
                        onChange={(s, e) => {
                            setStartDate(s);
                            setEndDate(e);
                        }}
                        leaveSummary={detail.leaveSummary}
                        attendanceSummary={attendanceSummary}
                    />
                </div>

                <div className="space-y-6">
                    <TimesheetTable 
                        entries={detail.entries} 
                        attendanceDaily={attendanceDaily}
                        month={timesheetParams?.month || startDate.slice(0, 7)}
                        onDayClick={setSelectedDay}
                    />
                </div>
            </div>
            
            {selectedDay && (
                <AttendanceDayDetailPopup
                    attendanceData={selectedDay}
                    employeeInfo={employeeInfo}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </DetailShell>
    );
}

/* ===== Cards & Tables ===== */

function LeaveSummaryCard({
    month,
    onChange,
    leaveSummary,
    attendanceSummary,
}: {
    month: string;
    onChange: (s: string, e: string) => void;
    leaveSummary: ManagerTimesheetDetailData["leaveSummary"];
    attendanceSummary: AttendanceSummary | null;
}) {
    return (
        <div
            className="rounded-2xl border border-dashed border-[#4AB4DE] bg-[#F4FBFF] p-5 text-[#1D3E6A] shadow-[6px_6px_0_#CCE1F0]">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A]">
                THỜI GIAN
            </div>

            <div className="mt-2 flex flex-col">
                <label className="text-xs font-semibold text-[#56749A] mb-1">Tháng</label>
                <input
                    type="month"
                    value={month.slice(0, 7)}
                    onChange={(e) => onChange(e.target.value, e.target.value)}
                    className="rounded-xl border border-[#CCE1F0] bg-white px-3 py-2 text-sm text-[#1D3E6A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]"
                />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                <div
                    className="inline-flex items-center w-full gap-2 rounded-full border border-black bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] shadow-[3px_3px_0_#CCE1F0]"
                >
                    số ngày nghỉ phép năm đã sử dụng
                    <span className="ml-auto rounded-full bg-[#4AB4DE] px-2 py-0.5 text-xs font-semibold text-white">
                        {attendanceSummary?.usedleave ?? leaveSummary.takenDays}
                    </span>
                </div>
                <div
                    className="inline-flex items-center w-full gap-2 rounded-full border border-black bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] shadow-[3px_3px_0_#CCE1F0]"
                >
                    Số ngày công chuẩn
                    <span className="ml-auto rounded-full bg-[#4AB4DE] px-2 py-0.5 text-xs font-semibold text-white">
                        {attendanceSummary?.dayStandard ?? 0}
                    </span>
                </div>
                <div
                    className="inline-flex items-center w-full gap-2 rounded-full border border-black bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] shadow-[3px_3px_0_#CCE1F0]"
                >
                    Số ngày công cơm
                    <span className="ml-auto rounded-full bg-[#4AB4DE] px-2 py-0.5 text-xs font-semibold text-white">
                        {attendanceSummary?.daysMeal ?? 0}
                    </span>
                </div>
                <div
                    className="inline-flex items-center w-full gap-2 rounded-full border border-black bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] shadow-[3px_3px_0_#CCE1F0]"
                >
                    số lần đi muộn
                    <span className="ml-auto rounded-full bg-[#4AB4DE] px-2 py-0.5 text-xs font-semibold text-white">
                        {attendanceSummary?.lateCount ?? 0}
                    </span>
                </div>
                <div
                    className="inline-flex items-center gap-2 w-full rounded-full border border-black bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] shadow-[3px_3px_0_#CCE1F0]"
                >
                    số lần về sớm
                    <span className="ml-auto rounded-full bg-[#4AB4DE] px-2 py-0.5 text-xs font-semibold text-white">
                        {attendanceSummary?.earlyLeaveCount ?? 0}
                    </span>
                </div>

            </div>
        </div>
    );
}

function TimesheetTable({ 
    entries, 
    attendanceDaily, 
    month,
    onDayClick
}: { 
    entries: TimesheetEntry[]; 
    attendanceDaily: AttendanceDaily[];
    month: string;
    onDayClick: (data: AttendanceDaily) => void;
}) {
    // Tạo mảng chứa tất cả các ngày trong tháng
    const generateMonthDays = (monthStr: string): TimesheetEntry[] => {
        const [year, monthNum] = monthStr.split('-').map(Number);
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const days: TimesheetEntry[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, monthNum - 1, day);
            const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            const dayName = dayNames[date.getDay()];
            
            // Tìm dữ liệu từ API cho ngày này
            const dailyData = attendanceDaily.find(d => d.date === dateStr);

            if (dailyData) {
                // Nếu có dữ liệu từ API
                if (dailyData.isAbsent) {
                    // Nghỉ không phép
                    days.push({
                        id: dateStr,
                        day: dayName,
                        date: `${String(day).padStart(2, '0')}/${String(monthNum).padStart(2, '0')}/${year}`,
                        type: "leave",
                        note: "Nghỉ không phép",
                    });
                } else if (dailyData.leaveTypeCode) {
                    // Ngày nghỉ có phép
                    days.push({
                        id: dateStr,
                        day: dayName,
                        date: `${String(day).padStart(2, '0')}/${String(monthNum).padStart(2, '0')}/${year}`,
                        type: "leave",
                        note: dailyData.leaveTypeCode,
                    });
                } else {
                    // Ngày làm việc
                    const checkIn = dailyData.checkInTime ? dailyData.checkInTime.split('T')[1]?.substring(0, 5) : null;
                    const checkOut = dailyData.checkOutTime ? dailyData.checkOutTime.split('T')[1]?.substring(0, 5) : null;
                    
                    days.push({
                        id: dateStr,
                        day: dayName,
                        date: `${String(day).padStart(2, '0')}/${String(monthNum).padStart(2, '0')}/${year}`,
                        checkIn: checkIn,
                        checkOut: checkOut,
                        workHours: dailyData.workHours,
                        overtimeHours: dailyData.otHour,
                        type: "work",
                    });
                }
            } else {
                // Nếu không có dữ liệu, hiển thị là "Ngày nghỉ"
                days.push({
                    id: dateStr,
                    day: dayName,
                    date: `${String(day).padStart(2, '0')}/${String(monthNum).padStart(2, '0')}/${year}`,
                    type: "leave",
                    note: "Ngày nghỉ",
                    checkIn: null,
                    checkOut: null,
                    workHours: null,
                    overtimeHours: null,
                });
            }
        }

        return days;
    };

    const allDays = generateMonthDays(month);

    return (
        <section
            className="overflow-hidden rounded-2xl border border-black bg-white text-[#1D3E6A] shadow-[6px_6px_0_#CCE1F0]">
            <div className="h-[600px] overflow-y-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-[#CCE1F0] text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] sticky top-0 z-10">
                        <tr>
                            <th className="px-5 py-3 text-left">Ngày</th>
                            <th className="px-5 py-3 text-left">Giờ vào</th>
                            <th className="px-5 py-3 text-left">Giờ ra</th>
                            <th className="px-5 py-3 text-left">Giờ làm việc</th>
                            <th className="px-5 py-3 text-left">Tăng ca</th>
                            <th className="px-5 py-3 text-left"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {allDays.map((entry) => {
                            const dailyData = attendanceDaily.find(d => d.date === entry.id);
                            return (
                                <TimesheetTableRow 
                                    key={entry.id} 
                                    entry={entry} 
                                    dailyData={dailyData}
                                    onDayClick={onDayClick}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function OtherPeriodCard({
    startDate,
    endDate,
    onChange,
}: {
    startDate: string;
    endDate: string;
    onChange: (s: string, e: string) => void;
}) {
    return (
        <div
            className="rounded-2xl border border-dashed border-[#4AB4DE] bg-[#F4FBFF] p-5 text-[#1D3E6A] shadow-[6px_6px_0_#CCE1F0]">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#56749A]">
                Khoảng thời gian
            </div>
            <div className="mt-2 flex items-center gap-2">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onChange(e.target.value, endDate)}
                    className="border rounded px-2 py-1 text-sm"
                />
                <span className="text-[#56749A]">-</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onChange(startDate, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                />
            </div>
        </div>
    );
}

function OtherEntriesTable({ entries }: { entries?: TimesheetOtherEntry[] }) {
    if (!entries?.length) return null;

    return (
        <section
            className="overflow-hidden rounded-2xl border border-black bg-white text-[#1D3E6A] shadow-[6px_6px_0_#CCE1F0]">
            <table className="w-full border-collapse">
                <thead className="bg-[#CCE1F0] text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A]">
                    <tr>
                        <th className="px-5 py-3 text-left">Loại</th>
                        <th className="px-5 py-3 text-left">Mô tả</th>
                        <th className="px-5 py-3 text-left">Số tiền</th>
                        <th className="px-5 py-3 text-left">Ngày bắt đầu</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <tr
                            key={`${entry.type}-${entry.description}-${entry.startedOn}`}
                            className="border-b border-[#E6F2FB] last:border-0"
                        >
                            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">{entry.type}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">{entry.description}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">{entry.amount}</td>
                            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">{entry.startedOn}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

function TimesheetTableRow({ 
    entry, 
    dailyData, 
    onDayClick 
}: { 
    entry: TimesheetEntry; 
    dailyData?: AttendanceDaily;
    onDayClick: (data: AttendanceDaily) => void;
}) {
    const isLeave = entry.type === "leave";
    const isDefaultLeave = entry.note === "Ngày nghỉ";

    const handleDetailClick = () => {
        if (dailyData) {
            onDayClick(dailyData);
        }
    };

    return (
        <tr className="border-b border-[#E6F2FB] bg-white last:border-0">
            <td className="px-5 py-4 align-center">
                <div className="text-sm font-semibold text-[#1D3E6A]">
                    {entry.day}
                    <div className="text-xs font-normal text-[#56749A]">{entry.date}</div>
                </div>
            </td>
            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">
                {isLeave ? "--" : formatTime(entry.checkIn)}
            </td>
            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">
                {isLeave ? "--" : formatTime(entry.checkOut)}
            </td>
            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">
                {isLeave ? (
                    <span
                        className="inline-flex items-center rounded-full bg-[#FFEFD6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#B45309]">
                        {entry.note}
                    </span>
                ) : (
                    formatHours(entry.workHours, { fallback: "--" })
                )}
            </td>
            <td className="px-5 py-4 text-sm font-semibold text-[#1D3E6A]">
                {isLeave ? "--" : formatHours(entry.overtimeHours)}
            </td>
            <td className="px-5 py-4 text-right">
                {!isDefaultLeave && (
                    <button
                        type="button"
                        onClick={handleDetailClick}
                        className="inline-flex items-center justify-center rounded-full border border-[#4AB4DE] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] transition hover:bg-[#E6F7FF] cursor-pointer"
                    >
                        Chi tiết
                    </button>
                )}
            </td>
        </tr>
    );
}

/* ===== Attendance Detail Popup ===== */

function AttendanceDayDetailPopup({
    attendanceData,
    employeeInfo,
    onClose,
}: {
    attendanceData: AttendanceDaily;
    employeeInfo: EmployeeInfomation | null;
    onClose: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLateCounted, setIsLateCounted] = useState(attendanceData.isLateCounted);
    const [isEarlyLeaveCounted, setIsEarlyLeaveCounted] = useState(attendanceData.isEarlyLeaveCounted);
    const [isDayMeal, setIsDayMeal] = useState(attendanceData.isDayMeal);
    const [isSaving, setIsSaving] = useState(false);

    const formatDateTime = (dateTime: string) => {
        if (!dateTime) return "--";
        const timePart = dateTime.split('T')[1];
        return timePart?.substring(0, 5) || "--";
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const body: AttDailySummaryUpdateRequest = {
                isLateCounted,
                isEarlyLeaveCounted,
                isDayMeal,
            };

            const response = await fetch(
                `http://localhost:8080/api/attsummary/${attendanceData.id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update attendance');
            }

            // Sau khi save thành công, tắt chế độ edit và đóng popup
            setIsEditing(false);
            onClose();
            // Có thể thêm refresh data ở đây nếu cần
            window.location.reload();
        } catch (error) {
            console.error('Error updating attendance:', error);
            alert('Failed to update attendance');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <FormPopBoxNotScroll>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#CCE1F0]">
                    <h2 className="text-xl md:text-2xl font-bold text-[#1D3E6A]">Chi tiết chấm công</h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="rounded-full border border-[#4AB4DE] bg-white px-3 md:px-4 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-[#1D3E6A] transition hover:bg-[#E6F7FF] cursor-pointer"
                            >
                                Chỉnh sửa
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-[#56749A] hover:bg-[#E6F7FF] transition cursor-pointer"
                        >
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Main Content - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Employee Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F4FBFF] rounded-xl border border-[#CCE1F0]">
                            <div>
                                <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Mã nhân viên</label>
                                <p className="text-sm font-bold text-[#1D3E6A] mt-1">{employeeInfo?.employeeCode || "--"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Tên nhân viên</label>
                                <p className="text-sm font-bold text-[#1D3E6A] mt-1">{employeeInfo?.fullName || "--"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Vị trí</label>
                                <p className="text-sm font-bold text-[#1D3E6A] mt-1">{employeeInfo?.positionName || "--"}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Ngày</label>
                                <p className="text-sm font-bold text-[#1D3E6A] mt-1">{attendanceData.date}</p>
                            </div>
                        </div>

                        {/* Attendance Data */}
                        <div className="space-y-4">
                            <h3 className="text-base md:text-lg font-bold text-[#1D3E6A]">Thông tin chấm công</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Loại ngày</label>
                                    <p className="text-sm font-bold text-[#1D3E6A]">{attendanceData.dayTypeName}</p>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Loại nghỉ phép</label>
                                    <p className="text-sm font-bold text-[#1D3E6A]">{attendanceData.leaveTypeCode || "--"}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Giờ vào</label>
                                    <p className="text-sm font-bold text-[#1D3E6A]">{formatDateTime(attendanceData.checkInTime)}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Giờ ra</label>
                                    <p className="text-sm font-bold text-[#1D3E6A]">{formatDateTime(attendanceData.checkOutTime)}</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Giờ làm việc</label>
                                    <p className="text-sm font-bold text-[#1D3E6A]">{attendanceData.workHours} giờ</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-[#56749A] uppercase tracking-wider">Giờ tăng ca</label>
                                    <p className="text-sm font-bold text-[#1D3E6A]">{attendanceData.otHour} giờ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Boolean Flags */}
                    <div className="space-y-4">
                        <h3 className="text-base md:text-lg font-bold text-[#1D3E6A]">Trạng thái</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isLateCounted}
                                    disabled={!isEditing}
                                    onChange={(e) => setIsLateCounted(e.target.checked)}
                                    className="w-5 h-5 rounded border-[#CCE1F0] text-[#4AB4DE] focus:ring-[#4AB4DE] cursor-pointer disabled:cursor-not-allowed"
                                />
                                <label className="text-sm font-semibold text-[#1D3E6A]">Tính đi muộn</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isEarlyLeaveCounted}
                                    disabled={!isEditing}
                                    onChange={(e) => setIsEarlyLeaveCounted(e.target.checked)}
                                    className="w-5 h-5 rounded border-[#CCE1F0] text-[#4AB4DE] focus:ring-[#4AB4DE] cursor-pointer disabled:cursor-not-allowed"
                                />
                                <label className="text-sm font-semibold text-[#1D3E6A]">Tính về sớm</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={attendanceData.isCountPayableDay}
                                    disabled
                                    className="w-5 h-5 rounded border-[#CCE1F0] text-[#4AB4DE] focus:ring-[#4AB4DE] cursor-pointer disabled:cursor-not-allowed"
                                />
                                <label className="text-sm font-semibold text-[#1D3E6A]">Tính ngày công</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={attendanceData.isAbsent}
                                    disabled
                                    className="w-5 h-5 rounded border-[#CCE1F0] text-[#4AB4DE] focus:ring-[#4AB4DE]cursor-pointer disabled:cursor-not-allowed"
                                />
                                <label className="text-sm font-semibold text-[#1D3E6A]">Vắng mặt</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={isDayMeal}
                                    disabled={!isEditing}
                                    onChange={(e) => setIsDayMeal(e.target.checked)}
                                    className="w-5 h-5 rounded border-[#CCE1F0] text-[#4AB4DE] focus:ring-[#4AB4DE] cursor-pointer disabled:cursor-not-allowed"
                                />
                                <label className="text-sm font-semibold text-[#1D3E6A]">Tính cơm</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={attendanceData.isTrialDay}
                                    disabled
                                    className="w-5 h-5 rounded border-[#CCE1F0] text-[#4AB4DE] focus:ring-[#4AB4DE] cursor-pointer disabled:cursor-not-allowed"
                                />
                                <label className="text-sm font-semibold text-[#1D3E6A]">Ngày thử việc</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-[#CCE1F0]">
                    {isEditing && (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setIsLateCounted(attendanceData.isLateCounted);
                                    setIsEarlyLeaveCounted(attendanceData.isEarlyLeaveCounted);
                                    setIsDayMeal(attendanceData.isDayMeal);
                                }}
                                className="rounded-full border border-[#56749A] bg-white px-6 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#56749A] transition hover:bg-gray-50 cursor-pointer"
                                disabled={isSaving}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-full border border-[#4AB4DE] bg-[#4AB4DE] px-6 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-[#3A9AC0] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </>
                    )}
                    {!isEditing && (
                        <button
                            onClick={onClose}
                            className="rounded-full border border-[#4AB4DE] bg-white px-6 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] transition hover:bg-[#E6F7FF] cursor-pointer"
                        >
                            Đóng
                        </button>
                    )}
                </div>
            </div>
        </FormPopBoxNotScroll>
    );
}

/* ===== utils.ts giữ nguyên ===== */
// export function formatDecimal(value: number, fractionDigits = 2) {
//     return value.toFixed(fractionDigits);
// }
//
// export function formatTime(value?: number | null) {
//     if (value === null || typeof value === "undefined") return "--";
//     return formatDecimal(value);
// }
//
// export function formatHours(value?: number | null, {fallback = "N/A"} = {}) {
//     if (value === null || typeof value === "undefined") return fallback;
//     return `${formatDecimal(value)}hrs`;
// }