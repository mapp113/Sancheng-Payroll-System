"use client";

import {useEffect, useState} from "react";
import {CalendarDays, Clock4, TimerReset} from "lucide-react";

type FirstCheckInResponse = {
    firstCheckIn: string;
    checkInTime: string | null;
};

type JwtPayload = {
    full_name?: string;
    employee_code?: string;
    [key: string]: any;
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

const timesheets = [
    {
        day: "Thứ 2",
        date: "12/08/2024",
        checkIn: "08:50",
        checkOut: "17:40",
        total: "8h 30p",
        note: "Đúng giờ",
    },
    {
        day: "Thứ 3",
        date: "13/08/2024",
        checkIn: "08:47",
        checkOut: "17:35",
        total: "8h 20p",
        note: "Đúng giờ",
    },
    {
        day: "Thứ 4",
        date: "14/08/2024",
        checkIn: "09:10",
        checkOut: "18:05",
        total: "8h 55p",
        note: "Đi trễ",
    },
    {
        day: "Thứ 5",
        date: "15/08/2024",
        checkIn: "08:45",
        checkOut: "17:25",
        total: "8h 10p",
        note: "Đúng giờ",
    },
    {
        day: "Thứ 6",
        date: "16/08/2024",
        checkIn: "08:58",
        checkOut: "16:50",
        total: "7h 52p",
        note: "Về sớm",
    },
];

export default function EmployeesDashboardPage() {
    const [employee, setEmployee] = useState<JwtPayload | null>(null);

    const [showCalendar, setShowCalendar] = useState(false);
    const [viewMode, setViewMode] = useState<"day" | "week">("day");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedWeek, setSelectedWeek] = useState<string>("");

    const [firstCheckIn, setFirstCheckIn] = useState<string | null>(null);
    const [loadingCheckIn, setLoadingCheckIn] = useState(false);
    const [errorCheckIn, setErrorCheckIn] = useState<string | null>(null);

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
        } catch (e: any) {
            console.error("🚨 Fetch error:", e);
            setErrorCheckIn(e.message || "Không lấy được giờ vào");
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
    }, [employee?.employee_code]);

    const handleChoose = () => {
        if (!employee?.employee_code) return;

        if (viewMode === "day") {
            fetchFirstCheckIn(employee.employee_code, selectedDate);
        } else {
            console.log("Xem theo tuần:", selectedWeek);
            // TODO: API theo tuần
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
                        <div
                            className="absolute -right-16 -top-10 h-44 w-44 rounded-full bg-white/20"
                            aria-hidden="true"
                        />
                        <div className="flex items-start gap-4">
                            <div>
                                <h2 className="mt-1 text-2xl font-semibold">
                                    {employee?.full_name ?? "Nguyễn Văn A"}
                                </h2>
                            </div>
                        </div>

                        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-white/80">ID</dt>
                                <dd className="text-lg font-semibold">
                                    {employee?.employee_code ?? "--"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-white/80">Ngày Bắt Đầu</dt>
                                <dd className="text-lg font-semibold">20/02/2024</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-white/80">Ngày Hết Hạn</dt>
                                <dd className="text-lg font-semibold">20/02/2025</dd>
                            </div>
                        </dl>
                    </section>
                </aside>

                {/* TIMELINE + TABLE */}
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

                    {/* TABLE */}
                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <header
                            className="flex flex-col gap-3 border-b border-[#CCE1F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-[#1F2A44]">
                                    Danh Sách Chấm Công
                                </h3>
                                <p className="text-sm text-[#1F2A44]/60">
                                    Trạng thái chấm công trong tuần này
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#4AB4DE] px-4 py-2 text-sm font-medium text-[#4AB4DE] hover:bg-[#EAF5FF]"
                            >
                                <CalendarDays className="h-4 w-4"/>
                                Xem lịch tháng / tuần
                            </button>
                        </header>

                        <div className="mt-6 overflow-hidden rounded-2xl border border-[#CCE1F0]">
                            <table className="min-w-full divide-y divide-[#CCE1F0] text-sm">
                                <thead className="bg-[#EAF5FF] text-xs uppercase text-[#345EA8]">
                                <tr>
                                    <th className="px-4 py-3 text-left">Ngày</th>
                                    <th className="px-4 py-3 text-left">Check in</th>
                                    <th className="px-4 py-3 text-left">Check out</th>
                                    <th className="px-4 py-3 text-left">Tổng giờ</th>
                                    <th className="px-4 py-3 text-left">Ghi chú</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0F6FB] bg-white text-[#1F2A44]">
                                {timesheets.map((item) => (
                                    <tr key={item.date}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{item.day}</p>
                                            <p className="text-xs text-[#1F2A44]/60">{item.date}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Clock4 className="h-4 w-4 text-[#4AB4DE]"/>
                                                <span>{item.checkIn}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <TimerReset className="h-4 w-4 text-[#4AB4DE]"/>
                                                <span>{item.checkOut}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{item.total}</td>
                                        <td className="px-4 py-3">
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                item.note === "Đúng giờ"
                                    ? "bg-[#E8F7EF] text-[#1D7A47]"
                                    : item.note === "Đi trễ"
                                        ? "bg-[#FEF4E6] text-[#B35300]"
                                        : "bg-[#FBEFF5] text-[#A23D6D]"
                            }`}
                        >
                          {item.note}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </section>
            </div>

            {/* POPUP */}
            {showCalendar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
                        <h3 className="mb-3 text-lg font-semibold text-[#1F2A44]">
                            Chọn khoảng thời gian
                        </h3>

                        <div className="mb-4 flex gap-2 text-xs font-semibold">
                            <button
                                onClick={() => setViewMode("day")}
                                className={`flex-1 rounded-full px-3 py-2 ${
                                    viewMode === "day"
                                        ? "bg-[#4AB4DE] text-white"
                                        : "bg-[#E5E7EB] text-[#374151]"
                                }`}
                            >
                                Xem theo ngày
                            </button>
                            <button
                                onClick={() => setViewMode("week")}
                                className={`flex-1 rounded-full px-3 py-2 ${
                                    viewMode === "week"
                                        ? "bg-[#4AB4DE] text-white"
                                        : "bg-[#E5E7EB] text-[#374151]"
                                }`}
                            >
                                Xem theo tuần
                            </button>
                        </div>

                        {viewMode === "day" ? (
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-[#1F2A44]">Chọn ngày</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2"
                                />
                            </label>
                        ) : (
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-[#1F2A44]">Chọn tuần</span>
                                <input
                                    type="week"
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="w-full rounded-xl border px-3 py-2"
                                />
                                <span className="text-[11px] text-[#6B7280]">
                  Ví dụ: 2024-W33
                </span>
                            </label>
                        )}

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowCalendar(false)}
                                className="rounded-full bg-[#E5E7EB] px-4 py-2 text-sm"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleChoose}
                                className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm text-white"
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
