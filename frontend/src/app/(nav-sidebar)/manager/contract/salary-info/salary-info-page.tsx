"use client";
import {ArrowLeft, Pencil} from "lucide-react";
import {useCallback, useEffect, useMemo, useState} from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

type PayrollRow = {
    id: number;
    label: string;
    value: string;
    startDate: string;
    endDate: string;
    rawStartDate?: string;
    rawEndDate?: string | null;
    baseSalaryValue?: number;
    baseHourlyRate?: number;
    status?: string;
};

type AllowanceRow = {
    id: number;
    typeId?: number;
    name: string;
    typeName: string;
    amount: string;
    startDate: string;
    endDate: string;
    rawStartDate?: string;
    rawEndDate?: string | null;
    status: string;
};

type PayComponentTypeOption = {
    id: number;
    name: string;
    description?: string;
};

const initialAllowances: AllowanceRow[] = [];

type SalaryInfoProps = {
    employeeCode?: string;
};

// Helper function to decode JWT token
function parseJwt(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

export function SalaryInfoPage({employeeCode}: SalaryInfoProps) {
    const code = useMemo(() => {
        return employeeCode || "";
    }, [employeeCode]);

    // ⭐ NEW: State to track current user info
    const [currentUserRole, setCurrentUserRole] = useState<string>("");
    const [currentUserEmployeeCode, setCurrentUserEmployeeCode] = useState<string>("");

    // ⭐ NEW: Extract token info on mount
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                setCurrentUserRole(decoded.role_name || "");
                setCurrentUserEmployeeCode(decoded.employee_code || "");
            }
        }
    }, []);

    // ⭐ NEW: Check if current user is HR viewing their own salary
    const isViewingOwnSalary = useMemo(() => {
        if (!currentUserRole || !currentUserEmployeeCode || !code) {
            return false;
        }
        if (currentUserRole.toLowerCase() === "hr") {
            return currentUserEmployeeCode.toLowerCase() === code.toLowerCase();
        }
        return false;
    }, [currentUserRole, currentUserEmployeeCode, code]);

    const [rows, setRows] = useState<PayrollRow[]>([]);
    const [loadingSalary, setLoadingSalary] = useState(false);

    const [showSalaryModal, setShowSalaryModal] = useState(false);
    const [editingSalaryId, setEditingSalaryId] = useState<number | null>(null);
    const [baseSalary, setBaseSalary] = useState("");
    const [baseHourlyRate, setBaseHourlyRate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [salaryStatus, setSalaryStatus] = useState("ACTIVE");
    const [submittingSalary, setSubmittingSalary] = useState(false);

    const resetSalaryForm = () => {
        setBaseSalary("");
        setBaseHourlyRate("");
        setStartDate("");
        setEndDate("");
        setSalaryStatus("ACTIVE");
        setEditingSalaryId(null);
    };

    const fetchSalaryInformation = useCallback(async () => {
        if (!code) return;

        setLoadingSalary(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/hr/users/${code}/salary-information`,
            );
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const payload = await response.json();
            const salaryRows: PayrollRow[] = (payload?.data ?? []).map(
                (item: {
                    id: number;
                    baseSalary?: number;
                    baseHourlyRate?: number;
                    effectiveFrom?: string;
                    effectiveTo?: string | null;
                    status?: string;
                }) => ({
                    id: item.id,
                    label: "Lương cơ bản",
                    value: formatCurrency(item.baseSalary),
                    startDate: formatDate(item.effectiveFrom),
                    endDate: formatDate(item.effectiveTo),
                    rawStartDate: item.effectiveFrom,
                    rawEndDate: item.effectiveTo,
                    baseSalaryValue: item.baseSalary,
                    baseHourlyRate: item.baseHourlyRate,
                    status: item.status,
                }),
            );
            setRows(salaryRows);
        } catch (error) {
            console.error("Không thể tải thông tin lương", error);
        } finally {
            setLoadingSalary(false);
        }
    }, [code]);

    const handleEditSalary = (row: PayrollRow) => {
        setEditingSalaryId(row.id);
        setBaseSalary(
            row.baseSalaryValue !== undefined && row.baseSalaryValue !== null
                ? String(row.baseSalaryValue)
                : "",
        );
        setBaseHourlyRate(
            row.baseHourlyRate !== undefined && row.baseHourlyRate !== null
                ? String(row.baseHourlyRate)
                : "",
        );
        setStartDate(row.rawStartDate || "");
        setEndDate(row.rawEndDate || "");
        setSalaryStatus(row.status || "ACTIVE");
        setShowSalaryModal(true);
    };

    const handleSaveSalary = async () => {
        if (!code || !baseSalary || !startDate) return;

        setSubmittingSalary(true);
        try {
            const isEditing = Boolean(editingSalaryId);
            const response = await fetch(
                isEditing
                    ? `${API_BASE_URL}/api/v1/hr/users/${code}/salary-information/${editingSalaryId}`
                    : `${API_BASE_URL}/api/v1/hr/users/${code}/salary-information`,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        baseSalary: Number(baseSalary),
                        baseHourlyRate: Number(baseHourlyRate) || 0,
                        effectiveFrom: startDate,
                        effectiveTo: endDate || null,
                        status: salaryStatus,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await fetchSalaryInformation();
            resetSalaryForm();
            setShowSalaryModal(false);
        } catch (error) {
            console.error("Không thể thêm thông tin lương", error);
        } finally {
            setSubmittingSalary(false);
        }
    };

    const handleCancelSalary = () => {
        resetSalaryForm();
        setShowSalaryModal(false);
    };

    const [allowanceRows, setAllowanceRows] = useState<AllowanceRow[]>(initialAllowances);
    const [loadingAllowances, setLoadingAllowances] = useState(false);
    const [payComponentTypes, setPayComponentTypes] = useState<PayComponentTypeOption[]>([]);

    const [showAllowanceModal, setShowAllowanceModal] = useState(false);
    const [allowTypeId, setAllowTypeId] = useState("");
    const [allowName, setAllowName] = useState("");
    const [allowAmount, setAllowAmount] = useState("");
    const [allowStart, setAllowStart] = useState("");
    const [allowEnd, setAllowEnd] = useState("");
    const [submittingAllowance, setSubmittingAllowance] = useState(false);

    // ⭐ NEW: Modal riêng để cập nhật ngày kết thúc trợ cấp
    const [showAllowanceEndDateModal, setShowAllowanceEndDateModal] = useState(false);
    const [editingAllowance, setEditingAllowance] = useState<AllowanceRow | null>(null);
    const [editAllowanceEnd, setEditAllowanceEnd] = useState("");
    const [savingAllowanceEnd, setSavingAllowanceEnd] = useState(false);

    const resetAllowanceForm = () => {
        setAllowTypeId("");
        setAllowName("");
        setAllowAmount("");
        setAllowStart("");
        setAllowEnd("");
    };

    const fetchPayComponentTypes = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/hr/pay-component-types`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const payload = await response.json();
            setPayComponentTypes(payload?.data ?? []);
        } catch (error) {
            console.error("Không thể tải loại trợ cấp", error);
        }
    }, []);

    const fetchAllowances = useCallback(async () => {
        if (!code) return;

        setLoadingAllowances(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/hr/users/${code}/pay-components`,
            );
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const payload = await response.json();
            const allowances: AllowanceRow[] = (payload?.data ?? []).map(
                (item: {
                    id: number;
                    typeId?: number;
                    typeName?: string;
                    name?: string;
                    value?: number;
                    startDate?: string;
                    endDate?: string | null;
                }) => ({
                    id: item.id,
                    typeId: item.typeId,
                    name: item.name ?? "—",
                    typeName: item.typeName ?? "—",
                    amount: formatCurrency(item.value),
                    startDate: formatDate(item.startDate),
                    endDate: formatDate(item.endDate),
                    rawStartDate: item.startDate,
                    rawEndDate: item.endDate,
                    status: "",
                }),
            );
            setAllowanceRows(allowances);
        } catch (error) {
            console.error("Không thể tải trợ cấp", error);
        } finally {
            setLoadingAllowances(false);
        }
    }, [code]);

    const handleSaveAllowance = async () => {
        if (!code || !allowTypeId || !allowName || !allowAmount || !allowStart) return;

        setSubmittingAllowance(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/v1/hr/users/${code}/pay-components`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        typeId: Number(allowTypeId),
                        name: allowName,
                        description: allowName,
                        value: Number(allowAmount),
                        startDate: allowStart,
                        endDate: allowEnd || null,
                        isAddition: true,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await fetchAllowances();
            resetAllowanceForm();
            setShowAllowanceModal(false);
        } catch (error) {
            console.error("Không thể thêm trợ cấp", error);
        } finally {
            setSubmittingAllowance(false);
        }
    };

    const handleCancelAllowance = () => {
        resetAllowanceForm();
        setShowAllowanceModal(false);
    };

    // ⭐ NEW: Mở modal chỉnh ngày kết thúc trợ cấp
    const handleOpenAllowanceEndDateModal = (allowance: AllowanceRow) => {
        setEditingAllowance(allowance);
        setEditAllowanceEnd(allowance.rawEndDate ?? "");
        setShowAllowanceEndDateModal(true);
    };

    // ⭐ NEW: Lưu ngày kết thúc trợ cấp trong modal
    const handleSaveAllowanceEndDate = async () => {
        if (!code || !editingAllowance) return;

        setSavingAllowanceEnd(true);
        try {
            const trimmedValue = editAllowanceEnd.trim();

            const response = await fetch(
                `${API_BASE_URL}/api/v1/hr/users/${code}/pay-components/${editingAllowance.id}`,
                {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        endDate: trimmedValue === "" ? null : trimmedValue,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await fetchAllowances();
            setShowAllowanceEndDateModal(false);
            setEditingAllowance(null);
            setEditAllowanceEnd("");
        } catch (error) {
            console.error("Không thể cập nhật ngày kết thúc trợ cấp", error);
        } finally {
            setSavingAllowanceEnd(false);
        }
    };

    const handleCancelAllowanceEndDate = () => {
        setShowAllowanceEndDateModal(false);
        setEditingAllowance(null);
        setEditAllowanceEnd("");
    };

    useEffect(() => {
        fetchSalaryInformation();
        fetchAllowances();
        fetchPayComponentTypes();
    }, [fetchAllowances, fetchPayComponentTypes, fetchSalaryInformation]);

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

    return (
        <div className="min-h-full bg-[#EAF5FF] p-6 text-[#1F2A44]">
            <div className="mx-auto max-w-6xl space-y-6">
                <button
                    type="button"
                    className="flex items-center gap-3 text-sm font-semibold text-[#4AB4DE] hover:underline cursor-pointer"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="h-5 w-5"/>
                    <span>QUAY LẠI</span>
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
                                {/* ⭐ NEW: Warning for HR viewing own salary */}
                                {isViewingOwnSalary && (
                                    <p className="text-sm font-medium text-amber-600">
                                        ⚠️ Bạn đang xem thông tin lương của chính mình - Không thể
                                        chỉnh sửa
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="space-y-6">
                    <div className="space-y-4">
                        <div className="rounded-3xl bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-3">
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
                                        <th className="px-4 py-3 font-semibold">
                                            Ngày bắt đầu
                                        </th>
                                        <th className="px-4 py-3 font-semibold">
                                            Ngày kết thúc
                                        </th>
                                        {/* ⭐ NEW: Edit column */}
                                        {!isViewingOwnSalary && (
                                            <th className="px-5 py-3 font-semibold">
                                                Chỉnh sửa
                                            </th>
                                        )}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EAF5FF] bg-white">
                                    {loadingSalary ? (
                                        <tr>
                                            <td
                                                className="px-4 py-3 text-center"
                                                colSpan={isViewingOwnSalary ? 4 : 5}
                                            >
                                                Đang tải thông tin lương...
                                            </td>
                                        </tr>
                                    ) : rows.length ? (
                                        rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="hover:bg-[#F7FBFF]"
                                            >
                                                <td className="px-4 py-3 font-semibold">
                                                    {row.label}
                                                </td>
                                                <td className="px-4 py-3">{row.value}</td>
                                                <td className="px-4 py-3">{row.startDate}</td>
                                                <td className="px-4 py-3">{row.endDate}</td>
                                                {/* ⭐ NEW: Edit button */}
                                                {!isViewingOwnSalary && (
                                                    <td className="px-10 py-3 align-middle">
                                                        <button
                                                            onClick={() =>
                                                                handleEditSalary(row)
                                                            }
                                                            className="rounded-full p-2 text-[#4AB4DE] hover:bg-slate-100"
                                                        >
                                                            <Pencil className="h-4 w-4"/>
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                className="px-4 py-3 text-center"
                                                colSpan={isViewingOwnSalary ? 4 : 5}
                                            >
                                                Chưa có thông tin lương để hiển thị
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>

                            {/* ⭐ UPDATED: Hide button for HR viewing own salary */}
                            {!isViewingOwnSalary && (
                                <div className="mt-6 flex justify-end">
                                    <button
                                        className="rounded-full bg-[#CCE1F0] px-4 py-2 text-sm font-semibold text-[#345EA8] shadow hover:bg-[#B8D8EC]"
                                        onClick={() => {
                                            resetSalaryForm();
                                            setShowSalaryModal(true);
                                        }}
                                    >
                                        Thêm 1 thông tin lương mới
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#1F2A44]">
                                        Trợ cấp nhân viên hiện có
                                    </h2>
                                </div>
                            </div>
                            {/* ⭐ UPDATED: Hide button for HR viewing own salary */}
                            {!isViewingOwnSalary && (
                                <button
                                    className="rounded-full bg-[#CCE1F0] px-4 py-2 text-sm font-semibold text-[#345EA8] shadow hover:bg-[#B8D8EC]"
                                    onClick={() => {
                                        resetAllowanceForm();
                                        setShowAllowanceModal(true);
                                    }}
                                >
                                    Thêm trợ cấp, thưởng mới
                                </button>
                            )}
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
                                    {/* ⭐ UPDATED: Hide column for HR viewing own salary */}
                                    {!isViewingOwnSalary && (
                                        <th className="px-4 py-3 font-semibold">Chỉnh sửa</th>
                                    )}
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-[#EAF5FF] bg-white">
                                {loadingAllowances ? (
                                    <tr>
                                        <td
                                            className="px-4 py-3 text-center"
                                            colSpan={isViewingOwnSalary ? 5 : 6}
                                        >
                                            Đang tải trợ cấp...
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
                                            <td className="px-4 py-3 text-sm">
                                                {allowance.typeName}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {allowance.amount}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {allowance.startDate}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {allowance.endDate}
                                            </td>
                                            {!isViewingOwnSalary && (
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenAllowanceEndDateModal(
                                                                allowance,
                                                            )
                                                        }
                                                        className="rounded-full border border-[#CCE1F0] bg-white px-3 py-1 text-xs font-semibold text-[blue] shadow hover:bg-red-50"
                                                    >
                                                        Cập nhật
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            className="px-4 py-3 text-center"
                                            colSpan={isViewingOwnSalary ? 5 : 6}
                                        >
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
                                {editingSalaryId
                                    ? "Chỉnh sửa Lương cơ bản"
                                    : "Tạo Lương cơ bản mới"}
                            </h3>
                        </div>

                        <div className="space-y-5 text-sm font-semibold text-[#003344]">
                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Giá trị</span>
                                <input
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    type="number"
                                    value={baseSalary}
                                    onChange={(e) => setBaseSalary(e.target.value)}
                                    placeholder="VD: 20000000"
                                />
                            </div>

                            {/* ⭐ NEW: Lương theo giờ */}
                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                {/*<span>Lương theo giờ</span>*/}
                                {/*<input*/}
                                {/*    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"*/}
                                {/*    type="number"*/}
                                {/*    value={baseHourlyRate}*/}
                                {/*    onChange={(e) => setBaseHourlyRate(e.target.value)}*/}
                                {/*    placeholder="VD: 50000"*/}
                                {/*/>*/}
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
                            {/* ⭐ SỬA: gọi đúng hàm lưu lương */}
                            <button
                                onClick={handleSaveSalary}
                                className="min-w-[120px] rounded-full bg-[#4AB4DE] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#3A9BC2] disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={submittingSalary}
                            >
                                {submittingSalary ? "Đang lưu..." : "Lưu"}
                            </button>

                            {/* ⭐ SỬA: gọi đúng hàm hủy lương */}
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
                                Thêm trợ cấp / thưởng mới
                            </h3>
                        </div>

                        <div className="space-y-5 text-sm font-semibold text-[#003344]">
                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Loại</span>
                                <select
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={allowTypeId}
                                    onChange={(e) => setAllowTypeId(e.target.value)}
                                >
                                    <option value="" disabled>
                                        Chọn loại phụ cấp
                                    </option>
                                    {payComponentTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Tên</span>
                                <input
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={allowName}
                                    onChange={(e) => setAllowName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-[140px,minmax(0,1fr)] items-center gap-4">
                                <span>Giá trị</span>
                                <input
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    type="number"
                                    value={allowAmount}
                                    onChange={(e) => setAllowAmount(e.target.value)}
                                    placeholder="VD: 500000"
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

                        </div>

                        <div className="mt-8 flex justify-center gap-6">
                            <button
                                onClick={handleSaveAllowance}
                                className="min-w-[120px] rounded-full bg-[#4AB4DE] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#3A9BC2] disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={submittingAllowance}
                            >
                                {submittingAllowance ? "Đang lưu..." : "Lưu"}
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

            {/* ⭐ NEW: Modal chỉnh sửa ngày kết thúc trợ cấp */}
            {showAllowanceEndDateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-[#CCE1F0] bg-white p-8 shadow-2xl">
                        <div className="mb-6 text-center">
                            <h3 className="text-lg font-semibold text-[#003344]">
                                Cập nhật ngày kết thúc trợ cấp
                            </h3>
                            <p className="mt-1 text-xs text-slate-500">
                                Để trống ngày kết thúc nếu bạn muốn áp dụng trợ cấp vô thời hạn.
                            </p>
                        </div>

                        <div className="space-y-4 text-sm font-semibold text-[#003344]">
                            <div className="grid grid-cols-[120px,minmax(0,1fr)] items-center gap-4">
                                <span>Trợ cấp</span>
                                <span className="font-normal">
                                    {editingAllowance?.name ?? "-"}
                                </span>
                            </div>

                            <div className="grid grid-cols-[120px,minmax(0,1fr)] items-center gap-4">
                                <span>Ngày kết thúc</span>
                                <input
                                    type="date"
                                    className="h-10 w-full rounded-full border border-[#CCE1F0] bg-[#F8FAFC] px-4 text-sm font-normal text-[#003344] focus:border-[#4AB4DE] focus:outline-none focus:ring-2 focus:ring-[#4AB4DE]/50"
                                    value={editAllowanceEnd}
                                    onChange={(e) => setEditAllowanceEnd(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center gap-6">
                            <button
                                onClick={handleSaveAllowanceEndDate}
                                className="min-w-[120px] rounded-full bg-[#4AB4DE] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#3A9BC2] disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={savingAllowanceEnd}
                            >
                                {savingAllowanceEnd ? "Đang lưu..." : "Lưu"}
                            </button>
                            <button
                                onClick={handleCancelAllowanceEndDate}
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
