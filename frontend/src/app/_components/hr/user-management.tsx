"use client";

import {Pencil, Plus, Search, X} from "lucide-react";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";   // ⭐ NEW

type Role = "HR" | "EMPLOYEE" | "ADMIN" | "MANAGER" | "ACCOUNTANT";

type UserItem = {
    userId: string;
    employeeCode: string;
    fullName: string;
    username: string;
    email: string;
    dob?: string;
    phoneNo: string;
    status: number | string;
    roleId?: number;
    roleName?: string;
};

type RawUserItem = UserItem & {
    userID?: string;
};

const normalizeUser = (user: RawUserItem): UserItem => ({
    ...user,
    userId: user.userId ?? user.userID ?? "",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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
    dependentsNo: string;
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
    dependentsNo?: string;
};

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
    dependentsNo: "",
};

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
        dependentsNo: data.dependentsNo ?? "",
    };
}

export default function UserManagement() {
    const router = useRouter(); // ⭐ NEW

    const [filterRole, setFilterRole] = useState<string>("all");
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile>(emptyProfile);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/api/v1/hr/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                    },
                });
                const json = await res.json();

                const data: UserItem[] = (json.data ?? []).map((u: RawUserItem) =>
                    normalizeUser(u)
                );
                setUsers(data);
            } catch (e) {
                console.error("fetch users error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        let list = [...users];
        if (filterRole !== "all") {
            list = list.filter(
                (u) => (u.roleName ?? "").toLowerCase() === filterRole.toLowerCase()
            );
        }
        if (search.trim() !== "") {
            const s = search.toLowerCase();
            list = list.filter((u) => u.fullName?.toLowerCase().includes(s));
        }
        return list;
    }, [users, filterRole, search]);

    const reloadUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/hr/users`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                },
            });
            const json = await res.json();
            const data: UserItem[] = (json.data ?? []).map((u: RawUserItem) => normalizeUser(u));
            setUsers(data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadProfile = async (employeeCode: string) => {
        if (!employeeCode) {
            setProfileError("Thiếu mã nhân viên để tải hồ sơ");
            return;
        }

        setProfileLoading(true);
        setProfileError(null);
        try {
            const res = await fetch(
                `${API_BASE}/api/v1/hr/users/${employeeCode}/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                    },
                }
            );
            if (!res.ok) {
                throw new Error("Không thể tải thông tin hồ sơ");
            }
            const data = (await res.json()) as EmployeeProfileResponse;
            setSelectedProfile(mapProfileResponse(data));
        } catch (error) {
            console.error(error);
            setProfileError("Không thể tải thông tin hồ sơ");
        } finally {
            setProfileLoading(false);
        }
    };

    const openProfileModal = async (employeeCode: string) => {
        setSelectedEmployeeCode(employeeCode);
        setProfileModalOpen(true);
        setSelectedProfile(emptyProfile);
        await loadProfile(employeeCode);
    };

    const closeProfileModal = () => {
        setProfileModalOpen(false);
        setSelectedEmployeeCode(null);
        setSelectedProfile(emptyProfile);
        setProfileError(null);
    };

    const handleProfileChange =
        (field: keyof EmployeeProfile) => (event: ChangeEvent<HTMLInputElement>) => {
            setSelectedProfile((prev) => ({...prev, [field]: event.target.value}));
        };

    const saveProfile = async () => {
        try {
            setProfileLoading(true);

            const payload = {
                fullName: selectedProfile.name || undefined,
                personalEmail: selectedProfile.personalEmail || undefined,
                dob: selectedProfile.dob || undefined,
                contractType: selectedProfile.contractType || undefined,
                phone: selectedProfile.phone || undefined,
                taxCode: selectedProfile.taxCode || undefined,
                status: selectedProfile.status || undefined,
                address: selectedProfile.address || undefined,
                joinDate: selectedProfile.joinDate || undefined,
                visaExpiry: selectedProfile.visaExpiry || undefined,
                contractUrl: selectedProfile.contractUrl || undefined,
                position: selectedProfile.position || undefined,
                citizenId: selectedProfile.citizenId || undefined,
                dependentsNo: selectedProfile.dependentsNo || undefined,
            };

            const sanitizedPayload = Object.fromEntries(
                Object.entries(payload).filter(([, value]) => value !== undefined)
            );

            if (!selectedEmployeeCode) {
                throw new Error("Không có mã nhân viên để cập nhật");
            }

            const response = await fetch(
                `${API_BASE}/api/v1/hr/users/${selectedEmployeeCode}/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                    },
                    body: JSON.stringify(sanitizedPayload),
                }
            );

            if (!response.ok) {
                throw new Error("Cập nhật hồ sơ thất bại");
            }

            const data = (await response.json()) as EmployeeProfileResponse;
            setSelectedProfile(mapProfileResponse(data));
            closeProfileModal();
            await reloadUsers();
        } catch (error) {
            console.error(error);
            setProfileError("Cập nhật hồ sơ thất bại");
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col gap-4 p-4 text-[#1F2A44]">
            <header className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Employee Management</h1>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
                <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold">List User</h2>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="relative flex items-center">
                                <Search className="absolute left-3 h-4 w-4 text-[#94A3B8]"/>
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm kiếm theo tên"
                                    className="w-full rounded-full border border-[#E2E8F0] py-2 pl-9 pr-3 text-sm focus:border-[#4AB4DE] focus:outline-none"
                                />
                            </label>
                            <select
                                value={filterRole}
                                onChange={(event) => setFilterRole(event.target.value)}
                                className="rounded-full border border-[#E2E8F0] px-4 py-2 text-sm focus:border-[#4AB4DE] focus:outline-none"
                            >
                                <option value="all">All</option>
                                <option value="Admin">Admin</option>
                                <option value="HR">HR</option>
                                <option value="Manager">Manager</option>
                                <option value="Employee">Employee</option>
                                <option value="Accountant">Accountant</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E2E8F0]">
                        <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
                            <thead className="bg-[#F8FAFC] text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">UserID</th>
                                <th className="px-4 py-3 font-medium">EmployeeCode</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Position</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-1 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium text-right">Edit</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-[#E2E8F0]">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-sm text-slate-500"
                                    >
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={`${user.employeeCode}-${user.userId}`}
                                        className="hover:bg-[#F1F5F9]"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                                            {user.userId}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 font-medium">
                                            {user.employeeCode}
                                        </td>
                                        <td
                                            className="whitespace-nowrap px-4 py-3 font-medium text-[#4AB4DE] hover:underline cursor-pointer"
                                            onClick={() => openProfileModal(user.employeeCode)}
                                        >
                                            {user.fullName}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {user.roleName}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        user.status === 1 ||
                                                        user.status === "Hoạt động"
                                                            ? "bg-[#DCFCE7] text-[#15803D]"
                                                            : "bg-[#FEE2E2] text-[#B91C1C]"
                                                    }`}
                                                >
                                                    {user.status === 1 ||
                                                    user.status === "Hoạt động"
                                                        ? "Hoạt động"
                                                        : "Tạm khóa"}
                                                </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-[#557099]">
                                            {user.phoneNo}
                                        </td>

                                        {/* ⭐ NEW COLUMN — EDIT BUTTON */}
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <button
                                                onClick={() => {
                                                    if (!user.employeeCode) return;
                                                    router.push(
                                                        `/manager/contract/salary-info/${encodeURIComponent(
                                                            user.employeeCode,
                                                        )}`,
                                                    );
                                                }}
                                                className="p-2 rounded-full hover:bg-slate-100 text-[#4AB4DE]"
                                            >
                                                <Pencil className="h-4 w-4"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* ===== PROFILE MODAL (GIỮ NGUYÊN) ===== */}
            {profileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-[#1F2A44]">
                                    Chỉnh sửa hồ sơ
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Hồ sơ được tải và cập nhật theo mã nhân viên:{" "}
                                    {selectedEmployeeCode ?? "-"}
                                </p>
                            </div>
                            <button
                                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                                onClick={closeProfileModal}
                            >
                                <X className="h-5 w-5"/>
                            </button>
                        </div>

                        {profileError && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {profileError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className="flex flex-col gap-1 text-sm">
                                Họ và tên
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.name}
                                    onChange={handleProfileChange("name")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Email
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.personalEmail}
                                    onChange={handleProfileChange("personalEmail")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Chức vụ
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.position}
                                    onChange={handleProfileChange("position")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Ngày vào làm
                                <input
                                    type="date"
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.joinDate}
                                    onChange={handleProfileChange("joinDate")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Ngày sinh
                                <input
                                    type="date"
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.dob}
                                    onChange={handleProfileChange("dob")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Số điện thoại
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.phone}
                                    onChange={handleProfileChange("phone")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Địa chỉ
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.address}
                                    onChange={handleProfileChange("address")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Loại hợp đồng
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.contractType}
                                    onChange={handleProfileChange("contractType")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                CCCD
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.citizenId}
                                    onChange={handleProfileChange("citizenId")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Ngày hết hạn hợp đồng
                                <input
                                    type="date"
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.visaExpiry}
                                    onChange={handleProfileChange("visaExpiry")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Số người phụ thuộc
                                <input
                                    type="number"
                                    min={0}
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.dependentsNo}
                                    onChange={handleProfileChange("dependentsNo")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Mã số thuế
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.taxCode}
                                    onChange={handleProfileChange("taxCode")}
                                    disabled={profileLoading}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Tải lên hợp đồng
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2"
                                    value={selectedProfile.contractUrl}
                                    onChange={handleProfileChange("contractUrl")}
                                    disabled={profileLoading}
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
                                onClick={closeProfileModal}
                                disabled={profileLoading}
                            >
                                Đóng
                            </button>
                            <button
                                className="inline-flex items-center gap-2 rounded-full bg-[#4AB4DE] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#3c9ec3] disabled:cursor-not-allowed disabled:opacity-70"
                                onClick={saveProfile}
                                disabled={profileLoading}
                            >
                                {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
