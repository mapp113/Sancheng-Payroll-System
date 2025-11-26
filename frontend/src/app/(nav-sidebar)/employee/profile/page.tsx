"use client";

import type {ReactNode, ChangeEvent} from "react";
import {useEffect, useState} from "react";
import Link from "next/link";

import {
    CalendarClock,
    Home,
    IdCard,
    Mail,
    Phone,
    Shield,
    UserRound,
    FileDown,
} from "lucide-react";

type EmployeeProfile = {
    id: string;
    name: string;
    position: string;
    joinDate: string;
    personalEmail: string;
    contractType: string;
    phone: string;
    dob: string;
    status: string;
    citizenId: string;
    address: string;
    visaExpiry: string;
    contractUrl: string;
    taxCode: string;
};

type EmployeeProfileResponse = {
    employeeCode?: string;
    fullName?: string;
    position?: string;
    joinDate?: string;
    personalEmail?: string;
    contractType?: string;
    phone?: string;
    dob?: string;
    status?: string;
    citizenId?: string;
    address?: string;
    visaExpiry?: string;
    contractUrl?: string;
    taxCode?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const EMPLOYEE_EDITABLE_FIELDS = new Set<keyof EmployeeProfile>([
    "personalEmail",
    "phone",
    "address",
]);

const emptyProfile: EmployeeProfile = {
    id: "",
    name: "",
    position: "",
    joinDate: "",
    personalEmail: "",
    contractType: "",
    phone: "",
    dob: "",
    status: "",
    citizenId: "",
    address: "",
    visaExpiry: "",
    contractUrl: "",
    taxCode: "",
};

function formatDateDisplay(value: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN").format(date);
}

// function formatCurrency(value: string) {
//     if (!value) return "";
//     const numeric = Number(value);
//     if (Number.isNaN(numeric)) return value;
//     return new Intl.NumberFormat("vi-VN", {
//         style: "currency",
//         currency: "VND",
//         maximumFractionDigits: 0,
//     }).format(numeric);
// }

function mapProfileResponse(data: EmployeeProfileResponse): EmployeeProfile {
    return {
        id: data.employeeCode ?? "",
        name: data.fullName ?? "",
        position: data.position ?? "",
        joinDate: data.joinDate ?? "",
        personalEmail: data.personalEmail ?? "",
        contractType: data.contractType ?? "",
        phone: data.phone ?? "",
        dob: data.dob ?? "",
        status: data.status ?? "",
        citizenId: data.citizenId ?? "",
        address: data.address ?? "",
        visaExpiry: data.visaExpiry ?? "",
        contractUrl: data.contractUrl ?? "",
        taxCode: data.taxCode ?? "",
    };
}

function parseNumber(value: string) {
    if (!value.trim()) return undefined;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? undefined : numeric;
}

export default function DetailEmployeePage() {
    const [employee, setEmployee] = useState<EmployeeProfile>(emptyProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [role, setRole] = useState<string>("EMPLOYEE");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const sessionUser = window.sessionStorage.getItem("scpm.auth.user");
        try {
            if (sessionUser) {
                const parsed = JSON.parse(sessionUser);
                if (parsed?.token) {
                    setRole(parsed.role ?? "EMPLOYEE");
                    setToken(parsed.token as string);
                    return;
                }
            }
        } catch (err) {
            console.error("Failed to parse session user", err);
        }

        const storedToken = localStorage.getItem("access_token") ?? "";
        setToken(storedToken);
    }, []);

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setError(null);

            if (!token) {
                setError("Không tìm thấy token đăng nhập");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Không thể tải thông tin hồ sơ");
                }

                const data = (await response.json()) as EmployeeProfileResponse;
                setEmployee(mapProfileResponse(data));
            } catch (err) {
                console.error(err);
                setError("Không thể tải thông tin hồ sơ");
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [token]);

    // popup đổi mật khẩu
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange =
        (field: keyof EmployeeProfile) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                setEmployee((prev) => ({...prev, [field]: e.target.value}));
            };

    const canEditField = (field: keyof EmployeeProfile) =>
        field !== "position" && (role === "HR" || EMPLOYEE_EDITABLE_FIELDS.has(field));

    const handleSave = async () => {
        if (!token) {
            setError("Không tìm thấy token đăng nhập");
            return;
        }

        try {
            const payload = role === "HR"
                ? {
                    fullName: employee.name || undefined,
                    personalEmail: employee.personalEmail || undefined,
                    dob: employee.dob || undefined,
                    contractType: employee.contractType || undefined,
                    phone: employee.phone || undefined,
                    taxCode: employee.taxCode || undefined,
                    status: employee.status || undefined,
                    address: employee.address || undefined,
                    joinDate: employee.joinDate || undefined,
                    visaExpiry: employee.visaExpiry || undefined,
                    contractUrl: employee.contractUrl || undefined,
                }
                : {
                    personalEmail: employee.personalEmail || undefined,
                    phone: employee.phone || undefined,
                    address: employee.address || undefined,
                };

            const sanitizedPayload = Object.fromEntries(
                Object.entries(payload).filter(([, value]) => value !== undefined),
            );

            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(sanitizedPayload),
            });

            if (!response.ok) {
                throw new Error("Cập nhật hồ sơ thất bại");
            }

            const data = (await response.json()) as EmployeeProfileResponse;
            setEmployee(mapProfileResponse(data));
            setIsEditing(false);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Cập nhật hồ sơ thất bại");
        }
    };

    const handlePasswordInput =
        (field: keyof typeof passwordForm) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                setPasswordForm((prev) => ({...prev, [field]: e.target.value}));
            };

    const handlePasswordSave = () => {
        // TODO: validate + call API đổi mật khẩu
        setIsChangingPassword(false);
        setPasswordForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    return (
        <div className="min-h-screen bg-[#EAF5FF] px-4 py-6 text-[#1F2A44]">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                {/* Header */}
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/employee"
                        className="inline-flex items-center gap-2 rounded-full bg.white px-4 py-2 text-sm font-semibold text-[#1F2A44] shadow-sm transition hover:shadow-md"
                    >
                        <span className="text-lg leading-none">⬅</span>
                        Back
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsChangingPassword(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#FFDD7D] px-4 py-2 text-sm font-semibold text-[#1F2A44] shadow-sm transition hover:bg-[#fbd568] hover:shadow-md"
                    >
                        <Shield className="h-4 w-4"/>
                        Đổi Mật Khẩu
                    </button>
                </header>

                {/* Thông tin nhân viên */}
                <div className="grid gap-6">
                    {error ? (
                        <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700 shadow-sm">
                            {error}
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                            Đang tải thông tin hồ sơ...
                        </div>
                    ) : null}

                    <section className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h2 className="text-lg font-semibold text-[#1F2A44]">
                                Thông tin nhân viên
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3ba1ca] hover:shadow-md"
                            >
                                ✏️ Chỉnh sửa
                            </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <InfoField
                                label="Mã Nhân Viên"
                                icon={<IdCard className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.id || "—"}
                            </InfoField>

                            <InfoField
                                label="Họ và tên"
                                icon={<UserRound className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.name || "—"}
                            </InfoField>

                            <InfoField
                                label="Chức vụ"
                                icon={<Shield className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.position || "—"}
                            </InfoField>

                            <InfoField
                                label="Ngày Bắt Đầu"
                                icon={<CalendarClock className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {formatDateDisplay(employee.joinDate) || "—"}
                            </InfoField>

                            <InfoField
                                label="E-Mail"
                                icon={<Mail className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.personalEmail || "—"}
                            </InfoField>

                            <InfoField
                                label="Thời hạn kết thúc"
                                icon={<CalendarClock className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {formatDateDisplay(employee.visaExpiry) || "—"}
                            </InfoField>

                            <InfoField
                                label="Ngày Sinh"
                                icon={<CalendarClock className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {formatDateDisplay(employee.dob) || "—"}
                            </InfoField>

                            <InfoField
                                label="Loại hợp đồng"
                                icon={<Shield className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.contractType || "—"}
                            </InfoField>


                            <InfoField
                                label="Điện thoại"
                                icon={<Phone className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.phone || "—"}
                            </InfoField>

                            <InfoField
                                label="Tình trạng"
                                icon={<Shield className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.status || "—"}
                            </InfoField>

                            <InfoField
                                label="CCCD"
                                icon={<IdCard className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.citizenId || "—"}
                            </InfoField>

                            <InfoField
                                label="Mã Số Thuế"
                                icon={<IdCard className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.taxCode || "—"}
                            </InfoField>

                            <InfoField
                                label="Địa chỉ"
                                icon={<Home className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.address || "—"}
                            </InfoField>


                            {/* Nút tải hợp đồng */}
                            <InfoField
                                label="Hợp đồng lao động"
                                icon={<FileDown className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                <button
                                    type="button"
                                    onClick={() => window.open(employee.contractUrl, "_blank")}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3ba1ca] hover:shadow-md"
                                    disabled={!employee.contractUrl}
                                >
                                    ⬇️ Tải hợp đồng
                                </button>
                            </InfoField>

                        </div>
                    </section>
                </div>
            </div>

            {/* Popup chỉnh sửa thông tin nhân viên */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-lg font-semibold text-[#1F2A44]">
                            Chỉnh sửa thông tin nhân viên
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <EditField
                                label="Họ và tên"
                                value={employee.name}
                                onChange={handleChange("name")}
                                disabled={!canEditField("name")}
                            />
                            <EditField
                                label="Chức vụ"
                                value={employee.position}
                                onChange={handleChange("position")}
                                disabled={!canEditField("position")}
                            />
                            <EditField
                                label="E-Mail"
                                value={employee.personalEmail}
                                onChange={handleChange("personalEmail")}
                                disabled={!canEditField("personalEmail")}
                            />
                            <EditField
                                label="Ngày Sinh"
                                value={employee.dob}
                                onChange={handleChange("dob")}
                                type="date"
                                disabled={!canEditField("dob")}
                            />
                            <EditField
                                label="Loại hợp đồng"
                                value={employee.contractType}
                                onChange={handleChange("contractType")}
                                disabled={!canEditField("contractType")}
                            />

                            <EditField
                                label="Điện thoại"
                                value={employee.phone}
                                onChange={handleChange("phone")}
                                disabled={!canEditField("phone")}
                            />
                            <EditField
                                label="Mã Số Thuế"
                                value={employee.taxCode}
                                onChange={handleChange("taxCode")}
                                disabled={!canEditField("taxCode")}
                            />
                            <EditField
                                label="Tình trạng"
                                value={employee.status}
                                onChange={handleChange("status")}
                                disabled={!canEditField("status")}
                            />
                            <EditField
                                label="Địa chỉ"
                                value={employee.address}
                                onChange={handleChange("address")}
                                disabled={!canEditField("address")}
                            />
                            <EditField
                                label="Thời hạn kết thúc"
                                value={employee.visaExpiry}
                                onChange={handleChange("visaExpiry")}
                                type="date"
                                disabled={!canEditField("visaExpiry")}
                            />
                            <EditField
                                label="Ngày bắt đầu"
                                value={employee.joinDate}
                                onChange={handleChange("joinDate")}
                                type="date"
                                disabled={!canEditField("joinDate")}
                            />


                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-full bg-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#d4d7dd]"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3ba1ca]"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup đổi mật khẩu */}
            {isChangingPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                        <h3 className="mb-4 text-lg font-semibold text-[#1F2A44]">
                            Đổi mật khẩu
                        </h3>
                        <div className="space-y-4">
                            <EditField
                                label="Mật khẩu hiện tại"
                                value={passwordForm.oldPassword}
                                onChange={handlePasswordInput("oldPassword")}
                                type="password"
                            />
                            <EditField
                                label="Mật khẩu mới"
                                value={passwordForm.newPassword}
                                onChange={handlePasswordInput("newPassword")}
                                type="password"
                            />
                            <EditField
                                label="Xác nhận mật khẩu mới"
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordInput("confirmPassword")}
                                type="password"
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsChangingPassword(false)}
                                className="rounded-full bg-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#d4d7dd]"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handlePasswordSave}
                                className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3ba1ca]"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface InfoFieldProps {
    label: string;
    icon?: ReactNode;
    children: ReactNode;
}

function InfoField({label, icon, children}: InfoFieldProps) {
    return (
        <div
            className="flex flex-col justify-between gap-1 rounded-2xl border border-[#CCE1F0] bg-[#F8FCFF] p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#345EA8]">
                {icon}
                {label}
            </p>
            <p className="break-words text-sm font-semibold text-[#1F2A44]">
                {children}
            </p>
        </div>
    );
}

interface EditFieldProps {
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    disabled?: boolean;
}

function EditField({label, value, onChange, type = "text", disabled}: EditFieldProps) {
    return (
        <label className="space-y-1 text-sm">
            <span className="font-semibold text-[#1F2A44]">{label}</span>
            <input
                className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] shadow-sm outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
                value={value}
                onChange={onChange}
                type={type}
                disabled={disabled}
            />
        </label>
    );
}
