import {CalendarDays, Clock4, DoorOpen, FileText, History, PlusCircle, TimerReset} from "lucide-react";

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
        // note: "Về sớm",
    },
];

const requestSummary = [
    {label: "Số ngày làm việc trong tuần", value: "05"},
    {label: "Số ngày làm việc trong tháng", value: "20"},
    {label: "Số giờ OT trong tuần", value: "04"},
    {label: "Số giờ OT trong tháng", value: "12"},
    {label: "Số ngày nghỉ", value: "02"},
];

export default function EmployeesDashboardPage() {
    return (
        <div className="flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <aside className="space-y-6">
                    <section
                        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4AB4DE] via-[#5cc6ef] to-[#c1f2ff] p-6 text-white shadow-lg">
                        <div className="absolute -right-16 -top-10 h-44 w-44 rounded-full bg-white/20"
                             aria-hidden="true"/>
                        <div className="flex items-start gap-4">

                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-white/80">Employee</p>
                                <h2 className="mt-1 text-2xl font-semibold">Nguyễn Văn A</h2>
                            </div>
                        </div>

                        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-white/80">ID</dt>
                                <dd className="text-lg font-semibold">PC1611</dd>
                            </div>
                            <div>
                                <dt className="text-white/80">Ngày Vào Công Ty</dt>
                                <dd className="text-lg font-semibold">20/02/2024</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-white/80">Mobile</dt>
                                <dd className="text-lg font-semibold">+84 963 333 899</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="space-y-3 rounded-3xl bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-[#1F2A44]">Tóm tắt yêu cầu</h3>
                        <div className="space-y-4 text-sm text-[#1F2A44]/80">
                            <p className="flex items-center gap-3 rounded-2xl border border-dashed border-[#CCE1F0] p-3">
                                <FileText className="h-5 w-5 text-[#4AB4DE]"/>
                                OT Ngày .....
                            </p>
                            <p className="flex items-center gap-3 rounded-2xl border border-dashed border-[#CCE1F0] p-3">
                                <History className="h-5 w-5 text-[#4AB4DE]"/>
                                Xin nghỉ phép ngày....
                            </p>

                        </div>
                    </section>
                </aside>

                <section className="flex flex-col gap-6">
                    {/* HÀNG 2 CỘT: Trái = Theo dõi chấm công, Phải = Tạo yêu cầu */}
                    <div className="grid gap-6 lg:grid-cols-[2fr_0.7fr]">

                        {/* Trái: THEO DÕI CHẤM CÔNG */}
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

                        {/* Phải: TẠO YÊU CẦU (thu nhỏ) */}
                        <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 shadow-sm text-sm">
                            <h3 className="text-base font-semibold text-[#1F2A44]">Tạo Yêu Cầu</h3>
                            <p className="text-xs text-[#1F2A44]/70">
                                Theo dõi và tạo yêu cầu khi cần.
                            </p>

                            <div className="space-y-3">
                                {requestSummary.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between rounded-xl border border-dashed border-[#CCE1F0] p-3"
                                    >
                                        <p className="text-[11px] font-medium text-[#1F2A44]">{item.label}</p>
                                        <span
                                            className="rounded-full bg-[#FBF6EF] px-3 py-1 text-[13px] font-semibold text-[#1F2A44]">
            {item.value}
          </span>
                                    </div>
                                ))}
                            </div>

                            <button type="button"
                                    className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#4AB4DE] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#3d9fc5]">
                                <PlusCircle className="h-3 w-3"/> Tạo yêu cầu
                            </button>
                        </div>
                    </div>


                    <section className="rounded-3xl bg-white p-6 shadow-sm">
                        <header
                            className="flex flex-col gap-3 border-b border-[#CCE1F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-[#1F2A44]">Danh sách Timesheet</h3>
                                <p className="text-sm text-[#1F2A44]/60">Trạng thái chấm công trong tuần
                                    này</p>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-full border border-[#4AB4DE] px-4 py-2 text-sm font-medium text-[#4AB4DE] transition hover:bg-[#EAF5FF]"
                            >
                                <CalendarDays className="h-4 w-4"/>
                                Xem lịch tháng
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
        </div>
    );
}