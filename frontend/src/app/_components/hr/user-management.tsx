"use client";

import {Search, X} from "lucide-react";
import {ChangeEvent, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";

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

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

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

// Helper function to decode JWT token
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error parsing JWT:", e);
        return null;
    }
}

export default function UserManagement() {
    const router = useRouter();

    const [filterRole, setFilterRole] = useState<string>("all");
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [selectedEmployeeCode, setSelectedEmployeeCode] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<EmployeeProfile>(emptyProfile);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [contractUploadError, setContractUploadError] = useState<string | null>(null);
    const [uploadingContract, setUploadingContract] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);


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

    const handleDownloadTemplate = async () => {
        if (!selectedEmployeeCode) {
            alert("Vui lòng chọn nhân viên trước khi tải hợp đồng mẫu");
            return;
        }

        setDownloadingTemplate(true);
        try {
            const response = await fetch(
                `${API_BASE}/api/v1/hr/users/${selectedEmployeeCode}/contract/template`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `contract-template-${selectedEmployeeCode}.docx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Tải hợp đồng mẫu thất bại", error);
            alert("Không thể tải hợp đồng mẫu. Vui lòng thử lại.");
        } finally {
            setDownloadingTemplate(false);
        }
    };

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

            // ⭐ MAP VÀ THÊM API_BASE VÀO CONTRACT URL
            const mappedProfile = mapProfileResponse(data);

            // Nếu contractUrl là relative path, thêm API_BASE
            if (mappedProfile.contractUrl && !mappedProfile.contractUrl.startsWith('http')) {
                mappedProfile.contractUrl = `${API_BASE}${mappedProfile.contractUrl}`;
            }

            setSelectedProfile(mappedProfile);
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

    const handleContractUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setContractUploadError("Vui lòng chọn tệp PDF");
            event.target.value = "";
            return;
        }

        if (!selectedEmployeeCode) {
            setContractUploadError("Chưa có mã nhân viên để tải hợp đồng");
            event.target.value = "";
            return;
        }

        setUploadingContract(true);
        setContractUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(
                `${API_BASE}/api/v1/hr/users/${selectedEmployeeCode}/contract/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                    },
                    body: formData,
                }
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Tải lên hợp đồng thất bại");
            }

            const json = await res.json();

            // ⭐ THÊM API_BASE VÀO URL
            const viewUrl = json.data?.viewUrl || json.data?.downloadUrl;

            if (viewUrl) {
                // Tạo URL đầy đủ với API_BASE
                const fullViewUrl = `${API_BASE}${viewUrl}`;
                setSelectedProfile((prev) => ({...prev, contractUrl: fullViewUrl}));

                alert(`Tải lên thành công: ${json.data?.fileName || file.name}`);
            }
        } catch (error) {
            console.error(error);
            setContractUploadError(
                error instanceof Error ? error.message : "Tải lên hợp đồng thất bại"
            );
        } finally {
            setUploadingContract(false);
            event.target.value = "";
        }
    };

    // ⭐ NEW: Check if current user is HR viewing their own profile
    const isEditingOwnProfile = useMemo(() => {
        if (!currentUserRole || !currentUserEmployeeCode || !selectedEmployeeCode) {
            return false;
        }
        if (currentUserRole.toLowerCase() === "hr") {
            return currentUserEmployeeCode.toLowerCase() === selectedEmployeeCode.toLowerCase();
        }
        return false;
    }, [currentUserRole, currentUserEmployeeCode, selectedEmployeeCode]);

    return (
        <div className="flex h-full flex-col gap-4 p-4 text-[#1F2A44]">
            <header className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Quản Lý Nhân Viên</h1>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
                <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold">Danh Sách</h2>
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
                                <option value="HR">HR</option>
                                <option value="Manager">Manager</option>
                                <option value="Employee">Employee</option>

                            </select>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto rounded-2xl border border-[#E2E8F0]">
                        <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
                            <thead className="bg-[#F8FAFC] text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">ID</th>
                                <th className="px-4 py-3 font-medium">Mã Nhân Viên</th>
                                <th className="px-4 py-3 font-medium">Họ Và Tên</th>
                                <th className="px-4 py-3 font-medium">Chức Vụ</th>
                                <th className="px-4 py-3 font-medium">Trạng Thái</th>
                                <th className="px-1 py-3 font-medium">Điện Thoại</th>
                                <th className="px-4 py-3 font-medium text-right">Thông Tin Lương</th>
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
                                                className="rounded-full border border-[#4AB4DE] px-4 py-1 text-xs font-medium text-[#4AB4DE] hover:bg-[#E0F2FE]"
                                            >
                                                Xem
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

            {/* ===== PROFILE MODAL (UPDATED) ===== */}
            {profileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="max-w-lg w-full bg-white p-6 shadow-xl rounded-lg max-h-[90vh] overflow-y-auto">
                        <div className="mb-4 flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-[#1F2A44]">
                                    {isEditingOwnProfile ? "Xem hồ sơ" : "Chỉnh sửa hồ sơ"}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Hồ sơ được tải và cập nhật theo mã nhân viên:{" "}
                                    {selectedEmployeeCode ?? "-"}
                                </p>
                                {/* ⭐ NEW: Warning message for HR viewing own profile */}
                                {isEditingOwnProfile && (
                                    <p className="mt-1 text-sm text-amber-600">
                                        Bạn không thể chỉnh sửa hồ sơ của chính mình
                                    </p>
                                )}
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
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.name}
                                    onChange={handleProfileChange("name")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Email
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.personalEmail}
                                    onChange={handleProfileChange("personalEmail")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Chức vụ
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.position}
                                    onChange={handleProfileChange("position")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Ngày vào làm
                                <input
                                    type="date"
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.joinDate}
                                    onChange={handleProfileChange("joinDate")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Ngày sinh
                                <input
                                    type="date"
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.dob}
                                    onChange={handleProfileChange("dob")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Số điện thoại
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.phone}
                                    onChange={handleProfileChange("phone")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Địa chỉ
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.address}
                                    onChange={handleProfileChange("address")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Loại hợp đồng
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.contractType}
                                    onChange={handleProfileChange("contractType")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                CCCD
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.citizenId}
                                    onChange={handleProfileChange("citizenId")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Ngày hết hạn hợp đồng
                                <input
                                    type="date"
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.visaExpiry}
                                    onChange={handleProfileChange("visaExpiry")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Số người phụ thuộc
                                <input
                                    type="number"
                                    min={0}
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.dependentsNo}
                                    onChange={handleProfileChange("dependentsNo")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Mã số thuế
                                <input
                                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                                    value={selectedProfile.taxCode}
                                    onChange={handleProfileChange("taxCode")}
                                    disabled={profileLoading || isEditingOwnProfile}
                                />
                            </label>

                            <label className="flex flex-col gap-1 text-sm">
                                Tải lên hợp đồng (PDF)
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                        onChange={handleContractUpload}
                                        disabled={profileLoading || uploadingContract || isEditingOwnProfile}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        disabled={
                                            profileLoading ||
                                            downloadingTemplate ||
                                            !selectedEmployeeCode ||
                                            isEditingOwnProfile
                                        }
                                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#4AB4DE] px-4 py-2 text-sm font-medium text-[#4AB4DE] transition enabled:hover:bg-[#E0F2FE] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {downloadingTemplate ? "Đang tải..." : "Tải hợp đồng mẫu"}
                                    </button>

                                    {/* ⭐ THÊM PHẦN XEM HỢP ĐỒNG */}
                                    {selectedProfile.contractUrl && (
                                        <div
                                            className="flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                                            <div className="flex items-center gap-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-red-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="font-medium text-[#1F2A44]">
                Hợp đồng đã tải lên
            </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {/* Nút Xem */}
                                                <button
                                                    onClick={() => {
                                                        // ⭐ XỬ LÝ URL ĐÃ CÓ SẴN API_BASE
                                                        window.open(selectedProfile.contractUrl, '_blank');
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#4AB4DE] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3c9ec3]"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                    Xem hợp đồng
                                                </button>

                                                {/* Nút Download */}
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            // ⭐ REPLACE /view THÀNH /download
                                                            const downloadUrl = selectedProfile.contractUrl.replace('/view', '/download');

                                                            const res = await fetch(downloadUrl, {
                                                                headers: {
                                                                    Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                                                                },
                                                            });

                                                            if (!res.ok) {
                                                                throw new Error("Không thể tải xuống file");
                                                            }

                                                            const blob = await res.blob();
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = `contract-${selectedEmployeeCode}.pdf`;
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            window.URL.revokeObjectURL(url);
                                                            document.body.removeChild(a);
                                                        } catch (error) {
                                                            console.error("Download failed:", error);
                                                            alert("Không thể tải xuống file");
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#4AB4DE] bg-white px-4 py-2 text-sm font-medium text-[#4AB4DE] transition hover:bg-[#E0F2FE]"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                        />
                                                    </svg>
                                                    Tải xuống
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {contractUploadError && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                            <div className="flex items-start gap-2">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-red-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <p className="text-sm text-red-600">{contractUploadError}</p>
                                            </div>
                                        </div>
                                    )}

                                    {uploadingContract && (
                                        <div
                                            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                            <svg
                                                className="h-5 w-5 animate-spin text-[#4AB4DE]"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            <p className="text-sm text-[#4AB4DE] font-medium">Đang tải lên...</p>
                                        </div>
                                    )}
                                </div>
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
                            {/* ⭐ NEW: Hide save button if editing own profile */}
                            {!isEditingOwnProfile && (
                                <button
                                    className="inline-flex items-center gap-2 rounded-full bg-[#4AB4DE] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#3c9ec3] disabled:cursor-not-allowed disabled:opacity-70"
                                    onClick={saveProfile}
                                    disabled={profileLoading}
                                >
                                    {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
