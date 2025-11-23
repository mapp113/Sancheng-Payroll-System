"use client";

import {useState} from "react";
import {CalendarDays, Clock4, TimerReset} from "lucide-react";

const checkInTime = "08:55";
const checkOutTime = "17:45";

const timelineNotes = [
    {title: "Giờ vào", value: checkInTime},
    {title: "Giờ Ra", value: checkOutTime},
];

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
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewMode, setViewMode] = useState<"day" | "week">("day");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedWeek, setSelectedWeek] = useState<string>("");

    const handleChoose = () => {
        if (viewMode === "day") {
            console.log("Xem theo ngày:", selectedDate);
            // TODO: gọi API load chấm công theo ngày / tháng
        } else {
            console.log("Xem theo tuần:", selectedWeek); // ví dụ: "2024-W33"
            // TODO: gọi API load chấm công theo tuần
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
                                <h2 className="mt-1 text-2xl font-semibold">Nguyễn Văn A</h2>
                            </div>
                        </div>

                        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-white/80">ID</dt>
                                <dd className="text-lg font-semibold">PC1611</dd>
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

                <section className="flex flex-col gap-6">
                    {/* THEO DÕI CHẤM CÔNG */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="rounded-3xl bg-white p-4 shadow-sm">
                            <div className="space-y-4">
                                <header>
                                    <h2 className="text-lg font-semibold text-[#1F2A44]">Theo dõi chấm công</h2>
                                    <p className="mt-1 text-xs text-[#1F2A44]/60">
                                        Kiểm tra giờ làm việc của bạn trong hôm nay
                                    </p>
                                </header>

                                <div className="grid gap-3 sm:grid-cols-2">
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
                    </div>

                    {/* DANH SÁCH CHẤM CÔNG */}
                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <header
                            className="flex flex-col gap-3 border-b border-[#CCE1F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-[#1F2A44]">Danh Sách Chấm Công</h3>
                                <p className="text-sm text-[#1F2A44]/60">
                                    Trạng thái chấm công trong tuần này
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCalendar(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#4AB4DE] px-4 py-2 text-sm font-medium text-[#4AB4DE] transition hover:bg-[#EAF5FF]"
                            >
                                <CalendarDays className="h-4 w-4"/>
                                Xem lịch tháng / tuần
                            </button>
                        </header>

                        <div className="mt-6 overflow-hidden rounded-2xl border border-[#CCE1F0]">
                            <table className="min-w-full divide-y divide-[#CCE1F0] text-sm">
                                <thead className="bg-[#EAF5FF] text-xs uppercase tracking-widest text-[#345EA8]">
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

            {/* POPUP CHỌN NGÀY / TUẦN */}
            {showCalendar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
                        <h3 className="mb-3 text-lg font-semibold text-[#1F2A44]">
                            Chọn khoảng thời gian
                        </h3>

                        {/* Chọn chế độ xem */}
                        <div className="mb-4 flex gap-2 text-xs font-semibold">
                            <button
                                type="button"
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
                                type="button"
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

                        {/* Input theo chế độ */}
                        {viewMode === "day" ? (
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-[#1F2A44]">Chọn ngày</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
                                />
                            </label>
                        ) : (
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="font-medium text-[#1F2A44]">Chọn tuần</span>
                                <input
                                    type="week"
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
                                />
                                <span className="text-[11px] text-[#6B7280]">
                                    Ví dụ: 2024-W33 (tuần 33 năm 2024)
                                </span>
                            </label>
                        )}

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
