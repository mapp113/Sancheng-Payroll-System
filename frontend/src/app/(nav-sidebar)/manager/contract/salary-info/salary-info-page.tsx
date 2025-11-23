"use client";

import {ArrowLeft, Pencil, Trash2} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useMemo, useState} from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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
    typeName: string;
    amount: string;
    startDate: string;
    endDate: string;
    status: string;
};

const initialAllowances: AllowanceRow[] = [];

type SalaryInfoProps = {
    employeeCode?: string;
};

export function SalaryInfoPage({employeeCode}: SalaryInfoProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const code = useMemo(() => {
        const paramCode = employeeCode || searchParams?.get("employeeCode") || "";
        return Array.isArray(paramCode) ? paramCode[0] : paramCode;
    }, [employeeCode, searchParams]);

    const [rows, setRows] = useState<PayrollRow[]>([]);
    const [loadingSalary, setLoadingSalary] = useState(false);

    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [label, setLabel] = useState("Lương cơ bản");
    const [value, setValue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const resetSalaryForm = () => {
        setLabel("Lương cơ bản");
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

    const [allowanceRows, setAllowanceRows] = useState<AllowanceRow[]>(initialAllowances);
    const [loadingAllowances, setLoadingAllowances] = useState(false);

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
        if (!allowName || !allowType || !allowAmount || !allowStart || !allowEnd) return;

        if (editingAllowanceId !== null) {
            setAllowanceRows((prev) =>
                prev.map((row) =>
                    row.id === editingAllowanceId
                        ? {
                            ...row,
                            name: allowName,
                            typeName: allowType,
                            amount: allowAmount,
                            startDate: allowStart,
                            endDate: allowEnd,
                            status: allowStatus,
                        }
                        : row,
                ),
            );
        } else {
            setAllowanceRows((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    name: allowName,
                    typeName: allowType,
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
        setAllowType(row.typeName);
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

    useEffect(() => {
        if (!code) return;

        const controller = new AbortController();
        const fetchSalaryInformation = async () => {
            setLoadingSalary(true);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/v1/hr/users/${code}/salary-information`,
                    {signal: controller.signal},
                );
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const payload = await response.json();
                const salaryRows: PayrollRow[] = (payload?.data ?? []).map(
                    (
                        item: {
                            baseSalary?: number;
                            effectiveFrom?: string;
                            effectiveTo?: string | null;
                        },
                        index: number,
                    ) => ({
                        id: index + 1,
                        label: "Lương cơ bản",
                        value: formatCurrency(item.baseSalary),
                        startDate: formatDate(item.effectiveFrom),
                        endDate: formatDate(item.effectiveTo),
                    }),
                );
                setRows(salaryRows);
            } catch (error) {
                console.error("Không thể tải thông tin lương", error);
            } finally {
                setLoadingSalary(false);
            }
        };

        fetchSalaryInformation();
        return () => controller.abort();
    }, [code]);

    useEffect(() => {
        if (!code) return;

        const controller = new AbortController();
        const fetchAllowances = async () => {
            setLoadingAllowances(true);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/v1/hr/users/${code}/pay-components`,
                    {signal: controller.signal},
                );
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const payload = await response.json();
                const allowances: AllowanceRow[] = (payload?.data ?? []).map(
                    (
                        item: {
                            typeId?: number;
                            typeName?: string;
                            name?: string;
                            value?: number;
                            startDate?: string;
                            endDate?: string | null;
                        },
                        index: number,
                    ) => ({
                        id: item.typeId ?? index + 1,
                        name: item.name ?? "—",
                        typeName: item.typeName ?? "—",
                        amount: formatCurrency(item.value),
                        startDate: formatDate(item.startDate),
                        endDate: formatDate(item.endDate),
                        status: deriveStatus(item.endDate),
                    }),
                );
                setAllowanceRows(allowances);
            } catch (error) {
                console.error("Không thể tải trợ cấp", error);
            } finally {
                setLoadingAllowances(false);
            }
        };

        fetchAllowances();
        return () => controller.abort();
    }, [code]);

    function formatDate(value?: string | null) {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString("vi-VN");
    }

    function formatCurrency(value?: number | string) {
        if (value === undefined || value === null || value === "") return "-";
        const parsed = typeof value === "string" ? Number(value) : value;
        if (Number.isNaN(parsed)) return String(value);
        return parsed.toLocaleString("vi-VN");
    }

    function deriveStatus(endDate?: string | null) {
        if (!endDate) return "Đang áp dụng";
        const end = new Date(endDate);
        if (Number.isNaN(end.getTime())) return "Đang áp dụng";
        return end >= new Date() ? "Đang áp dụng" : "Đã nhận";
    }

    return (
        <div className="min-h-full bg-[#EAF5FF] p-6 text-[#1F2A44]">
            <div className="mx-auto max-w-6xl space-y-6">
                <button
                    type="button"
                    className="flex items-center gap-3 text-sm font-semibold text-[#4AB4DE]"
                    onClick={() => router.push("/manager/contract")}
                >
                    <ArrowLeft className="h-5 w-5"/>
                    <span>BACK</span>
                </button>

                <header className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="space-y-1">
                                <h1 className="text-xl font-semibold text-[#345EA8]">
                                    Thông tin về lương của nhân viên
                                </h1>
                                <p className="text-sm text-[#56749A]">
                                    Mã nhân viên: {code || "(Chưa có mã)"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="space-y-6">
                    <div className="space-y-4">
                        <div className="rounded-3xl bg:white p-6 shadow-sm">
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
                                    {loadingSalary ? (
                                        <tr>
                                            <td className="px-4 py-3 text-center" colSpan={4}>
                                                Đang tải thông tin lương...
                                            </td>
                                        </tr>
                                    ) : rows.length ? (
                                        rows.map((row) => (
                                            <tr key={row.id} className="hover:bg-[#F7FBFF]">
                                                <td className="px-4 py-3 font-semibold">{row.label}</td>
                                                <td className="px-4 py-3">{row.value}</td>
                                                <td className="px-4 py-3">{row.startDate}</td>
                                                <td className="px-4 py-3">{row.endDate}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className="px-4 py-3 text-center" colSpan={4}>
                                                Chưa có thông tin lương để hiển thị
                                            </td>
                                        </tr>
                                    )}
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

                    <div className="rounded-3xl bg:white p-6 shadow-sm">
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
                                <tbody className="divide-y divide-[#EAF5FF] bg:white">
                                {loadingAllowances ? (
                                    <tr>
                                        <td className="px-4 py-3 text-center" colSpan={7}>
                                            Đang tải trợ cấp và thưởng...
                                        </td>
                                    </tr>
                                ) : allowanceRows.length ? (
                                    allowanceRows.map((allowance) => (
                                        <tr
                                            key={allowance.id}
                                            className="hover:bg-[#F7FBFF]"
                                        >
                                            <td className="px-4 py-3 font-semibold">
                                                {allowance.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{allowance.typeName}</td>
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
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-4 py-3 text-center" colSpan={7}>
                                            Chưa có trợ cấp hoặc thưởng để hiển thị
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>

            {showSalaryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-xl rounded-3xl border border-[#CCE1F0] bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center">
                            <h3 className="flex-1 text-center text-lg font-semibold text-[#003344]">
                                Tạo Lương cơ bản mới
                            </h3>
                        </div>

                        <div className="space-y-5 text-sm font-semibold text-[#003344]">
                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Nội dung</span>
                                <input
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    placeholder="VD: Lương cơ bản"
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Giá trị</span>
                                <input
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="VD: 20,000,000"
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày bắt đầu</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày kết thúc</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center gap-6">
                            <button
                                onClick={handleSaveSalary}
                                className="min-w-[120px] rounded-full bg-[#4AB4DE] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#3A9BC2]"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={handleCancelSalary}
                                className="min-w-[120px] rounded-full border border-[#CCE1F0] bg-white px-6 py-2 text-sm font-semibold text-[#004C5E] shadow hover:bg-[#F1F5F9]"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {showAllowanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-xl rounded-3xl border border-[#8CECF0] bg-white p-8 shadow-2xl">
                        <div className="mb-6 flex items-center">
                            <h3 className="flex-1 text-center text-lg font-semibold text-[#003344]">
                                {editingAllowanceId ? "Chỉnh sửa trợ cấp / thưởng" : "Thêm trợ cấp / thưởng mới"}
                            </h3>
                        </div>

                        <div className="space-y-5 text-sm font-semibold text-[#003344]">
                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Loại</span>
                                <select
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
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
                                <span>Tên</span>
                                <input
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={allowType}
                                    onChange={(e) => setAllowType(e.target.value)}
                                    placeholder="VD: Allowance 1"
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Giá trị</span>
                                <input
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={allowAmount}
                                    onChange={(e) => setAllowAmount(e.target.value)}
                                    placeholder="VD: 500k"
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày bắt đầu</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={allowStart}
                                    onChange={(e) => setAllowStart(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày kết thúc</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={allowEnd}
                                    onChange={(e) => setAllowEnd(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Trạng thái</span>
                                <select
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={allowStatus}
                                    onChange={(e) => setAllowStatus(e.target.value)}
                                >
                                    <option value="Đang áp dụng">Đang áp dụng</option>
                                    <option value="Đã nhận">Đã nhận</option>
                                    <option value="Tạm dừng">Tạm dừng</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center gap-6">
                            <button
                                onClick={handleSaveAllowance}
                                className="min-w-[120px] rounded-full bg-[#4AB4DE] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#3A9BC2]"
                            >
                                {editingAllowanceId ? "Cập nhật" : "Lưu"}
                            </button>
                            <button
                                onClick={handleCancelAllowance}
                                className="min-w-[120px] rounded-full border border-[#CCE1F0] bg-white px-6 py-2 text-sm font-semibold text-[#004C5E] shadow hover:bg-[#F1F5F9]"
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
