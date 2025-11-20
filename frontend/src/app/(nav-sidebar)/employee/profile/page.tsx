"use client";

import type {ReactNode, ChangeEvent} from "react";
import {useState} from "react";
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

const initialEmployee = {
    id: "PC1611",
    name: "Nguyễn Văn A",
    position: "Employee",
    joinDate: "20/02/2024",
    personalEmail: "nguyenvana@example.com",
    contractType: "Toàn thời gian",
    phone: "+84 84923275***",
    dob: "25/2/2004",
    status: "Đang Làm",
    citizenId: "1234 5678 9000",
    address: "120 Pasteur, Phường 06, Quận 3, Tp. HCM",
    visaExpiry: "20/02/2029",
    contractUrl: "/files/contracts/PC1611.pdf", // đường dẫn hợp đồng
    taxCode: "0123456789",
};

export default function DetailEmployeePage() {
    const [employee, setEmployee] = useState(initialEmployee);
    const [isEditing, setIsEditing] = useState(false);

    // popup đổi mật khẩu
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange =
        (field: keyof typeof initialEmployee) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                setEmployee((prev) => ({...prev, [field]: e.target.value}));
            };

    const handleSave = () => {
        // Ở đây bạn có thể gọi API update, hiện tại chỉ mock UI
        console.log("Saved data:", employee);
        setIsEditing(false);
    };

    const handlePasswordInput =
        (field: keyof typeof passwordForm) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                setPasswordForm((prev) => ({...prev, [field]: e.target.value}));
            };

    const handlePasswordSave = () => {
        // Mock xử lý đổi mật khẩu
        console.log("Password form:", passwordForm);
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
                        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1F2A44] shadow-sm transition hover:shadow-md"
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
                                {employee.id}
                            </InfoField>

                            <InfoField
                                label="Họ và tên"
                                icon={<UserRound className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.name}
                            </InfoField>

                            <InfoField
                                label="Chức vụ"
                                icon={<Shield className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.position}
                            </InfoField>

                            <InfoField
                                label="Ngày Bắt Đầu"
                                icon={<CalendarClock className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.joinDate}
                            </InfoField>

                            <InfoField
                                label="E-Mail cá nhân"
                                icon={<Mail className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.personalEmail}
                            </InfoField>
                            <InfoField
                                label="Ngày Sinh"
                                icon={<CalendarClock className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.dob}
                            </InfoField>

                            <InfoField
                                label="Loại hợp đồng"
                                icon={<Shield className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.contractType}
                            </InfoField>

                            <InfoField
                                label="Điện thoại"
                                icon={<Phone className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.phone}
                            </InfoField>

                            <InfoField
                                label="Tình trạng"
                                icon={<Shield className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.status}
                            </InfoField>

                            <InfoField
                                label="CCCD"
                                icon={<IdCard className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.citizenId}
                            </InfoField>
                            <InfoField
                                label="Mã Số Thuế"
                                icon={<IdCard className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.taxCode}
                            </InfoField>
                            <InfoField
                                label="Địa chỉ"
                                icon={<Home className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.address}
                            </InfoField>

                            <InfoField
                                label="Thời hạn kết thúc"
                                icon={<CalendarClock className="h-4 w-4 text-[#4AB4DE]"/>}
                            >
                                {employee.visaExpiry}
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
                            />
                            <EditField
                                label="Chức vụ"
                                value={employee.position}
                                onChange={handleChange("position")}
                            />
                            <EditField
                                label="E-Mail cá nhân"
                                value={employee.personalEmail}
                                onChange={handleChange("personalEmail")}
                            />
                            <EditField
                                label="Ngày Sinh"
                                value={employee.dob}
                                onChange={handleChange("dob")}
                            />
                            <EditField
                                label="Loại hợp đồng"
                                value={employee.contractType}
                                onChange={handleChange("contractType")}
                            />
                            <EditField
                                label="Điện thoại"
                                value={employee.phone}
                                onChange={handleChange("phone")}
                            />
                            <EditField
                                label="Mã Số Thuế"
                                value={employee.taxCode}
                                onChange={handleChange("taxCode")}
                            />
                            <EditField
                                label="Tình trạng"
                                value={employee.status}
                                onChange={handleChange("status")}
                            />
                            <EditField
                                label="Địa chỉ"
                                value={employee.address}
                                onChange={handleChange("address")}
                            />
                            <EditField
                                label="Thời hạn kết thúc"
                                value={employee.visaExpiry}
                                onChange={handleChange("visaExpiry")}
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

                        <div className="space-y-3">
                            <EditField
                                label="Mật khẩu cũ"
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
                                label="Nhập lại mật khẩu mới"
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
                                Back
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
}

function EditField({label, value, onChange, type = "text"}: EditFieldProps) {
    return (
        <label className="space-y-1 text-sm">
            <span className="font-semibold text-[#1F2A44]">{label}</span>
            <input
                className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-[#111827] shadow-sm outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
                value={value}
                onChange={onChange}
                type={type}
            />
        </label>
    );
}
