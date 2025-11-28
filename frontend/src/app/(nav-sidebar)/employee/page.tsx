"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

type FirstCheckInResponse = {
    firstCheckIn: string;
    checkInTime: string | null;
};
import { getUserData } from "@/app/_components/utils/getUserData";
import AttendanceTable from "@/app/_components/employee/attendance-table";
import type { EmployeeInfomation, AttendanceSummary } from "@/app/_components/manager-timesheet-detail/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type JwtPayload = {
    full_name?: string;
    employee_code?: string;
    [key: string]: unknown;
};

// Decode JWT base64url
function decodeJWT(token: string): JwtPayload | null {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const json = atob(padded);
        return JSON.parse(json);
    } catch (e) {
        console.error("Decode JWT error:", e);
        return null;
    }
}

export default function EmployeesDashboardPage() {
    const [employee, setEmployee] = useState<JwtPayload | null>(null);

    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
    const [employeeCode, setEmployeeCode] = useState<string>("");
    const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfomation | null>(null);
    const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedWeek] = useState<string>("");
    const [viewMode] = useState<"day" | "week">("day");
    const [firstCheckIn, setFirstCheckIn] = useState<string | null>(null);
    const [loadingCheckIn, setLoadingCheckIn] = useState(false);
    const [errorCheckIn, setErrorCheckIn] = useState<string | null>(null);


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
                const token = localStorage.getItem("scpm.auth.token");
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

    const formatTime = (raw: string | null): string | null => {
        if (!raw) return null;
        if (raw.length >= 5) return raw.slice(0, 5);
        return raw;
    };

    async function fetchFirstCheckIn(empCode: string, dateStr: string) {
        try {
            setLoadingCheckIn(true);
            setErrorCheckIn(null);

            const params = new URLSearchParams({
                employeeCode: empCode,
                date: dateStr,
            }).toString();

            const API_URL = `http://localhost:8080/api/att-records/first-check-in?${params}`;

            console.log("🔍 Calling API:", API_URL);

            const res = await fetch(API_URL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            console.log("📡 Response status:", res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ API Error:", errorText);
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const data: FirstCheckInResponse = await res.json();
            console.log("✅ Data received:", data);

            setFirstCheckIn(formatTime(data.firstCheckIn));
        } catch (e) {
            console.error("🚨 Fetch error:", e);
            setErrorCheckIn(e instanceof Error ? e.message : "Không lấy được giờ vào");
            setFirstCheckIn(null);
        } finally {
            setLoadingCheckIn(false);
        }
    }

    // Lấy token từ localStorage → decode JWT
    useEffect(() => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const decoded = decodeJWT(token);
        if (decoded) {
            setEmployee(decoded);
        }
    }, []);

    // Khi có employee_code → auto fetch hôm nay
    useEffect(() => {
        if (!employee?.employee_code) return;

        const today = new Date().toISOString().slice(0, 10);
        setSelectedDate(today);
        fetchFirstCheckIn(employee.employee_code, today);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee?.employee_code]);

    const handleChoose = () => {
        if (!employee?.employee_code) return;

        if (viewMode === "day") {
            fetchFirstCheckIn(employee.employee_code, selectedDate);
        } else {
            console.log("Xem theo tuần:", selectedWeek);
            // TODO: API theo tuần
        }

        if (selectedMonth) {
            setCurrentMonth(selectedMonth);
        }
        setShowCalendar(false);
    };

    const timelineNotes = [
        {
            title: "Giờ vào",
            value: firstCheckIn ?? (loadingCheckIn ? "Đang tải..." : "--:--"),
        },
    ];

    return (
        <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <aside className="space-y-6">
                    <section
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4AB4DE] via-[#5cc6ef] to-[#c1f2ff] p-6 text-white shadow-lg">
                        <div className="absolute -right-16 -top-10 h-44 w-44 rounded-full bg-white/20"
                            aria-hidden="true" />
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
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                            <header>
                                <h2 className="text-lg font-semibold text-[#1F2A44]">
                                    Theo dõi chấm công
                                </h2>
                                <p className="mt-1 text-xs text-[#1F2A44]/60">
                                    Kiểm tra giờ làm việc của bạn trong hôm nay
                                </p>
                                {errorCheckIn && (
                                    <p className="mt-1 text-xs text-red-500">{errorCheckIn}</p>
                                )}
                            </header>

                            <div className="grid gap-3 sm:grid-cols-2 mt-4">
                                {timelineNotes.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-xl border border-dashed border-[#CCE1F0] p-3 text-center"
                                    >
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4AB4DE]">
                                            {item.title}
                                        </p>
                                        <p className="mt-2 text-xl font-semibold text-[#1F2A44]">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

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
                                <CalendarDays className="h-4 w-4" />
                                Xem lịch tháng
                            </button>
                        </header>

                        {!employeeCode ? (
                            <div className="mt-6 flex items-center justify-center py-8">
                                <p className="text-gray-500">Đang tải thông tin nhân viên...</p>
                            </div>
                        ) : (
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
