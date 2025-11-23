"use client";

import {ArrowLeft, Pencil, Trash2} from "lucide-react";
import {useState} from "react";

const payrollInfo = [
    {label: "Lương cơ bản", value: "20,000,000"},
    {label: "Ngày nhận lương", value: "17 Jun 2021"},
    {label: "Ngày kết thúc hợp đồng", value: "17 Jun 2022"},
];

type PayrollRow = {
    id: number;
    label: string;
    value: string;
    startDate: string;
    endDate: string;
};

type AllowanceRow = {
    id: number;
    name: string;
    type: string;
    amount: string;
    startDate: string;
    endDate: string;
    status: string;
};

const initialAllowances: AllowanceRow[] = [
    {
        id: 1,
        name: "Bonus 1",
        type: "Allowance 1",
        amount: "500k",
        startDate: "17 Jun 2021",
        endDate: "-",
        status: "Đã nhận",
    },
    {
        id: 2,
        name: "Bonus 2",
        type: "Allowance 2",
        amount: "500k",
        startDate: "17 Jun 2021",
        endDate: "-",
        status: "Đã nhận",
    },
    {
        id: 3,
        name: "Bonus 3",
        type: "Allowance 3",
        amount: "500k",
        startDate: "17 Jun 2021",
        endDate: "-",
        status: "Đã nhận",
    },
    {
        id: 4,
        name: "Bonus 4",
        type: "Allowance 4",
        amount: "500k",
        startDate: "17 Jun 2021",
        endDate: "-",
        status: "Đã nhận",
    },
];

export default function SalaryInfoPage() {
    // ==== LƯƠNG ====
    const [rows, setRows] = useState<PayrollRow[]>([
        {
            id: 1,
            label: "Lương cơ bản",
            value: payrollInfo[0].value,
            startDate: "01 Jan 2021",
            endDate: payrollInfo[2].value,
        },
    ]);

    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [label, setLabel] = useState("");
    const [value, setValue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const resetSalaryForm = () => {
        setLabel("");
        setValue("");
        setStartDate("");
        setEndDate("");
    };

    const handleSaveSalary = () => {
        if (!label || !value || !startDate || !endDate) return;

        setRows((prev) => [
            ...prev,
            {
                id: Date.now(),
                label,
                value,
                startDate,
                endDate,
            },
        ]);
        resetSalaryForm();
        setShowSalaryModal(false);
    };

    const handleCancelSalary = () => {
        resetSalaryForm();
        setShowSalaryModal(false);
    };

    // ==== TRỢ CẤP ====
    const [allowanceRows, setAllowanceRows] =
        useState<AllowanceRow[]>(initialAllowances);

    const [showAllowanceModal, setShowAllowanceModal] = useState(false);
    const [allowName, setAllowName] = useState("Bonus 1");
    const [allowType, setAllowType] = useState("");
    const [allowAmount, setAllowAmount] = useState("");
    const [allowStart, setAllowStart] = useState("");
    const [allowEnd, setAllowEnd] = useState("");
    const [allowStatus, setAllowStatus] = useState("Đang áp dụng");
    const [editingAllowanceId, setEditingAllowanceId] = useState<number | null>(null);

    const resetAllowanceForm = () => {
        setAllowName("Bonus 1");
        setAllowType("");
        setAllowAmount("");
        setAllowStart("");
        setAllowEnd("");
        setAllowStatus("Đang áp dụng");
        setEditingAllowanceId(null);
    };

    const handleSaveAllowance = () => {
        if (!allowName || !allowType || !allowAmount || !allowStart || !allowEnd)
            return;

        if (editingAllowanceId !== null) {
            // cập nhật dòng
            setAllowanceRows((prev) =>
                prev.map((row) =>
                    row.id === editingAllowanceId
                        ? {
                            ...row,
                            name: allowName,
                            type: allowType,
                            amount: allowAmount,
                            startDate: allowStart,
                            endDate: allowEnd,
                            status: allowStatus,
                        }
                        : row,
                ),
            );
        } else {
            // thêm mới
            setAllowanceRows((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: allowName,
                    type: allowType,
                    amount: allowAmount,
                    startDate: allowStart,
                    endDate: allowEnd,
                    status: allowStatus,
                },
            ]);
        }

        resetAllowanceForm();
        setShowAllowanceModal(false);
    };

    const handleCancelAllowance = () => {
        resetAllowanceForm();
        setShowAllowanceModal(false);
    };

    const handleEditAllowance = (id: number) => {
        const row = allowanceRows.find((r) => r.id === id);
        if (!row) return;
        setAllowName(row.name);
        setAllowType(row.type);
        setAllowAmount(row.amount);
        setAllowStart(row.startDate);
        setAllowEnd(row.endDate === "-" ? "" : row.endDate);
        setAllowStatus(row.status);
        setEditingAllowanceId(id);
        setShowAllowanceModal(true);
    };

    const handleDeleteAllowance = (id: number) => {
        setAllowanceRows((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div className="min-h-full bg-[#EAF5FF] p-6 text-[#1F2A44]">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#4AB4DE]">
                    <ArrowLeft className="h-5 w-5"/>
                    <span>BACK</span>
                </div>

                <header className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="space-y-1">
                                <h1 className="text-xl font-semibold text-[#345EA8]">
                                    Thông tin về lương của nhân viên
                                </h1>
                                <p className="text-sm text-[#56749A]">Nguyen Van A - EMP001</p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="space-y-6">
                    {/* ==== THÔNG TIN LƯƠNG NHÂN VIÊN – BẢNG 4 CỘT ==== */}
                    <div className="space-y-4">
                        <div className="rounded-3xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-[#CCE1F0]/80"/>
                                <div>
                                    <h2 className="text-lg font-semibold text-[#1F2A44]">
                                        Thông tin Lương nhân viên
                                    </h2>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-[#CCE1F0]">
                                <table className="w-full text-sm text-[#1F2A44]">
                                    <thead
                                        className="bg-[#CCE1F0] text-left text-xs uppercase tracking-wider text-[#345EA8]">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nội dung</th>
                                        <th className="px-4 py-3 font-semibold">Giá trị</th>
                                        <th className="px-4 py-3 font-semibold">Ngày bắt đầu</th>
                                        <th className="px-4 py-3 font-semibold">Ngày kết thúc</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EAF5FF] bg-white">
                                    {rows.map((row) => (
                                        <tr key={row.id} className="hover:bg-[#F7FBFF]">
                                            <td className="px-4 py-3 font-semibold">{row.label}</td>
                                            <td className="px-4 py-3">{row.value}</td>
                                            <td className="px-4 py-3">{row.startDate}</td>
                                            <td className="px-4 py-3">{row.endDate}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    className="rounded-full bg-[#CCE1F0] px-4 py-2 text-sm font-semibold text-[#345EA8] shadow"
                                    onClick={() => setShowSalaryModal(true)}
                                >
                                    Thêm 1 thông tin lương mới
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ==== TRỢ CẤP NHÂN VIÊN HIỆN CÓ – BẢNG 7 CỘT (THÊM CHỈNH SỬA) ==== */}
                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-[#CCE1F0]/80"/>
                                <div>
                                    <h2 className="text-lg font-semibold text-[#1F2A44]">
                                        Trợ cấp nhân viên hiện có
                                    </h2>
                                </div>
                            </div>
                            <button
                                className="rounded-full bg-[#CCE1F0] px-4 py-2 text-sm font-semibold text-[#345EA8] shadow"
                                onClick={() => {
                                    resetAllowanceForm();
                                    setShowAllowanceModal(true);
                                }}
                            >
                                Thêm trợ cấp, thưởng mới
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[#CCE1F0]">
                            <table className="w-full text-sm text-[#1F2A44]">
                                <thead
                                    className="bg-[#CCE1F0] text-left text-xs uppercase tracking-wider text-[#345EA8]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Tên</th>
                                    <th className="px-4 py-3 font-semibold">Loại</th>
                                    <th className="px-4 py-3 font-semibold">Giá trị</th>
                                    <th className="px-4 py-3 font-semibold">Ngày bắt đầu</th>
                                    <th className="px-4 py-3 font-semibold">Ngày kết thúc</th>
                                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                                    <th className="px-4 py-3 font-semibold text-center">Chỉnh sửa</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EAF5FF] bg-white">
                                {allowanceRows.map((allowance) => (
                                    <tr
                                        key={allowance.id}
                                        className="hover:bg-[#F7FBFF]"
                                    >
                                        <td className="px-4 py-3 font-semibold">
                                            {allowance.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{allowance.type}</td>
                                        <td className="px-4 py-3 font-semibold">
                                            {allowance.amount}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {allowance.startDate}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{allowance.endDate}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#15803D]">
                                              {allowance.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditAllowance(allowance.id)}
                                                    className="rounded-full p-1 hover:bg-[#E2E8F0]"
                                                    aria-label="Chỉnh sửa"
                                                >
                                                    <Pencil className="h-4 w-4 text-[#4AB4DE]"/>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAllowance(allowance.id)}
                                                    className="rounded-full p-1 hover:bg-[#FEE2E2]"
                                                    aria-label="Xóa"
                                                >
                                                    <Trash2 className="h-4 w-4 text-[#B91C1C]"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            {/* ==== MODAL TẠO LƯƠNG MỚI ==== */}
            {showSalaryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-xl rounded-3xl border border-[#8CECF0] bg-white p-8 shadow-2xl">
                        <div className="mb-8 flex items-center">
                            <h3 className="flex-1 text-center text-lg font-semibold text-[#003344]">
                                Tạo Lương cơ bản mới
                            </h3>
                        </div>

                        <div className="space-y-6 text-sm font-semibold text-[#003344]">

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Giá trị</span>
                                <input
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="VD: 20,000,000"
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày bắt đầu</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày kết thúc</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-center gap-10">
                            <button
                                onClick={handleSaveSalary}
                                className="min-w-[120px] rounded-full px-6 py-2 text-sm font-semibold text-[#004C5E] shadow"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={handleCancelSalary}
                                className="min-w-[120px] rounded-full px-6 py-2 text-sm font-semibold text-[#004C5E] shadow"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==== MODAL TẠO / SỬA TRỢ CẤP MỚI ==== */}
            {showAllowanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-xl rounded-3xl border border-[#8CECF0] bg-white p-8 shadow-2xl">
                        <div className="mb-8 flex items-center">
                            <h3 className="flex-1 text-center text-lg font-semibold text-[#003344]">
                                {editingAllowanceId ? "Chỉnh sửa trợ cấp / thưởng" : "Thêm trợ cấp / thưởng mới"}
                            </h3>
                        </div>

                        <div className="space-y-6 text-sm font-semibold text-[#003344]">
                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Tên</span>
                                <select
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={allowName}
                                    onChange={(e) => setAllowName(e.target.value)}
                                >
                                    <option value="Bonus 1">Bonus 1</option>
                                    <option value="Bonus 2">Bonus 2</option>
                                    <option value="Bonus 3">Bonus 3</option>
                                    <option value="Bonus 4">Bonus 4</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Loại</span>
                                <input
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={allowType}
                                    onChange={(e) => setAllowType(e.target.value)}
                                    placeholder="VD: Allowance 1"
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Giá trị</span>
                                <input
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={allowAmount}
                                    onChange={(e) => setAllowAmount(e.target.value)}
                                    placeholder="VD: 500k"
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày bắt đầu</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={allowStart}
                                    onChange={(e) => setAllowStart(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày kết thúc</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={allowEnd}
                                    onChange={(e) => setAllowEnd(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Trạng thái</span>
                                <select
                                    className="h-10 w-full rounded-full px-4 text-sm font-normal text-[#003344]"
                                    value={allowStatus}
                                    onChange={(e) => setAllowStatus(e.target.value)}
                                >
                                    <option value="Đang áp dụng">Đang áp dụng</option>
                                    <option value="Đã nhận">Đã nhận</option>
                                    <option value="Tạm dừng">Tạm dừng</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-center gap-10">
                            <button
                                onClick={handleSaveAllowance}
                                className="min-w-[120px] rounded-full px-6 py-2 text-sm font-semibold text-[#004C5E] shadow"
                            >
                                {editingAllowanceId ? "Cập nhật" : "Lưu"}
                            </button>
                            <button
                                onClick={handleCancelAllowance}
                                className="min-w-[120px] rounded-full px-6 py-2 text-sm font-semibold text-[#004C5E] shadow"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
