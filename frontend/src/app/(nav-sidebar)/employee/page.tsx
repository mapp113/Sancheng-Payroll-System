"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { getUserData } from "@/app/_components/utils/getUserData";
import AttendanceTable from "@/app/_components/employee/attendance-table";
import type { EmployeeInfomation, AttendanceSummary } from "@/app/_components/manager-timesheet-detail/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function EmployeesDashboardPage() {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
    const [employeeCode, setEmployeeCode] = useState<string>("");
    const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfomation | null>(null);
    const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);

    // Get employee code from session
    useEffect(() => {
        const code = getUserData("employee_code");
        if (code) {
            setEmployeeCode(code);
        }
    }, []);

    // Fetch employee info
    useEffect(() => {
        const fetchEmployeeInfo = async () => {
            if (!employeeCode) return;

            try {
                const token = localStorage.getItem("access_token");
                const response = await fetch(
                    `${API_BASE_URL}/api/employees/${employeeCode}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    console.error("Failed to fetch employee information");
                    return;
                }

                const data: EmployeeInfomation = await response.json();
                setEmployeeInfo(data);
            } catch (error) {
                console.error("Error fetching employee info:", error);
            }
        };

        fetchEmployeeInfo();
    }, [employeeCode]);

    // Fetch attendance summary
    useEffect(() => {
        const fetchAttendanceSummary = async () => {
            if (!employeeCode || !currentMonth) return;

            try {
                const token = localStorage.getItem("access_token");
                const monthParam = `${currentMonth}-01`;
                const response = await fetch(
                    `${API_BASE_URL}/api/attsummary/month?month=${monthParam}&employeeCode=${employeeCode}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    console.error("Failed to fetch attendance summary");
                    setAttendanceSummary(null);
                    return;
                }

                const data: AttendanceSummary = await response.json();
                setAttendanceSummary(data);
            } catch (error) {
                console.error("Error fetching attendance summary:", error);
                setAttendanceSummary(null);
            }
        };

        fetchAttendanceSummary();
    }, [employeeCode, currentMonth]);

    const handleChoose = () => {
        if (selectedMonth) {
            setCurrentMonth(selectedMonth);
        }
        setShowCalendar(false);
    };

    return (
        <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <aside className="space-y-6">
                    <section
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4AB4DE] via-[#5cc6ef] to-[#c1f2ff] p-6 text-white shadow-lg">
                        <div className="absolute -right-16 -top-10 h-44 w-44 rounded-full bg-white/20"
                             aria-hidden="true"/>
                        <div className="flex items-start gap-4">
                            <div>
                                <h2 className="mt-1 text-2xl font-semibold">
                                    {employeeInfo?.fullName || "Nhân viên"}
                                </h2>
                            </div>
                        </div>

                        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-white/80">Mã nhân viên</dt>
                                <dd className="text-lg font-semibold">{employeeInfo?.employeeCode || employeeCode}</dd>
                            </div>
                            <div>
                                <dt className="text-white/80">Chức vụ</dt>
                                <dd className="text-lg font-semibold">{employeeInfo?.positionName || "--"}</dd>
                            </div>
                        </dl>
                    </section>

                    {/* Summary Cards */}
                    {attendanceSummary && (
                        <section className="space-y-3">
                            <div className="rounded-xl border border-dashed border-[#CCE1F0] bg-[#F4FBFF] p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#4AB4DE]">
                                    Tổng giờ làm việc
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                                    {(attendanceSummary.daysHours + attendanceSummary.otHours).toFixed(2)}h
                                </p>
                            </div>
                            <div className="rounded-xl border border-dashed border-[#CCE1F0] bg-[#F4FBFF] p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#4AB4DE]">
                                    Giờ tăng ca
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                                    {attendanceSummary.otHours.toFixed(2)}h
                                </p>
                            </div>
                            <div className="rounded-xl border border-dashed border-[#CCE1F0] bg-[#F4FBFF] p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#4AB4DE]">
                                    Số ngày công chuẩn
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#1F2A44]">
                                    {attendanceSummary.dayStandard}
                                </p>
                            </div>
                        </section>
                    )}
                </aside>

                <section className="flex flex-col gap-6">
                    {/* DANH SÁCH CHẤM CÔNG */}
                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <header
                            className="flex flex-col gap-3 border-b border-[#CCE1F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-[#1F2A44]">Danh Sách Chấm Công</h3>
                                <p className="text-sm text-[#1F2A44]/60">
                                    Tháng {currentMonth}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCalendar(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#4AB4DE] px-4 py-2 text-sm font-medium text-[#4AB4DE] transition hover:bg-[#EAF5FF]"
                            >
                                <CalendarDays className="h-4 w-4"/>
                                Xem lịch tháng
                            </button>
                        </header>

                        {employeeCode && (
                            <AttendanceTable 
                                employeeCode={employeeCode} 
                                month={currentMonth}
                            />
                        )}
                    </section>
                </section>
            </div>

            {/* POPUP CHỌN THÁNG */}
            {showCalendar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
                        <h3 className="mb-3 text-lg font-semibold text-[#1F2A44]">
                            Chọn tháng
                        </h3>

                        <label className="flex flex-col gap-1 text-sm">
                            <span className="font-medium text-[#1F2A44]">Chọn tháng</span>
                            <input
                                type="month"
                                value={selectedMonth || currentMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
                            />
                        </label>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCalendar(false)}
                                className="rounded-full bg-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#d4d7dd]"
                            >
                                Đóng
                            </button>
                            <button
                                type="button"
                                onClick={handleChoose}
                                className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3ba1ca]"
                            >
                                Xem dữ liệu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
