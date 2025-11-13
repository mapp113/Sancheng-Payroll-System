"use client";

import {useEffect, useMemo, useState} from "react";
import {Pencil, Plus, Search, X} from "lucide-react";

type Role = "HR" | "EMPLOYEE" | "ADMIN" | "MANAGER" | "ACCOUNTANT";

type UserItem = {
    userId: string;          // NEW: ID dùng cho máy chấm công
    employeeCode: string;    // PK trong DB
    fullName: string;
    username: string;
    email: string;
    dob?: string;
    phoneNo: string;
    status: number | string;
    roleId?: number;
    roleName?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function AdminPage() {
    const [filterRole, setFilterRole] = useState<string>("all");
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [search, setSearch] = useState("");

    const [roleSummaries, setRoleSummaries] = useState<
        { name: string; roleName: string; total: number }[]
    >([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/api/v1/admin/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                    },
                });
                const json = await res.json();

                // Chuẩn hóa để tương thích tên field từ BE
                const data: UserItem[] = (json.data ?? []).map((u: any) => ({
                    ...u,
                    userId: u.userId ?? u.userID ?? "", // fallback nếu BE trả tên khác
                }));
                setUsers(data);
            } catch (e) {
                console.error("fetch users error", e);
            } finally {
                setLoading(false);
            }
        };

        const fetchRoleSummary = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/v1/admin/role-summary`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                    },
                });
                const json = await res.json();
                setRoleSummaries(json.data ?? []);
            } catch (e) {
                console.error("fetch role summary error", e);
            }
        };

        fetchUsers();
        fetchRoleSummary();
    }, []);

    const filteredUsers = useMemo(() => {
        let list = users;
        if (filterRole !== "all") {
            list = list.filter((u) => (u.roleName ?? "").toLowerCase() === filterRole.toLowerCase());
        }
        if (search.trim() !== "") {
            const s = search.toLowerCase();
            list = list.filter((u) => u.fullName?.toLowerCase().includes(s));
        }
        return list;
    }, [users, filterRole, search]);

    const reloadUsers = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/admin/users`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                },
            });
            const json = await res.json();
            const data: UserItem[] = (json.data ?? []).map((u: any) => ({
                ...u,
                userId: u.userId ?? u.userID ?? "",
            }));
            setUsers(data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex h-full flex-col gap-4 p-4 text-[#1F2A44]">
            <header className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Account Management</h1>
                    <button
                        onClick={() => setOpenCreate(true)}
                        className="inline-flex items-center gap-2 self-start rounded-full bg-[#4AB4DE] px-4 py-2 text-white transition hover:bg-[#3c9ec3]"
                    >
                        <Plus className="h-4 w-4"/>
                        Tạo Tài Khoản
                    </button>
                </div>
            </header>

            <section className="grid grid-cols-5 gap-4">
                {roleSummaries.map((item) => (
                    <article
                        key={item.name}
                        className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mt-2 flex items-end justify-between">
                            <h3 className="text-xl font-semibold">{item.name}</h3>
                            <span className="text-3xl font-bold text-[#4AB4DE]">{item.total}</span>
                        </div>
                    </article>
                ))}
                {["Admin", "HR", "Employee", "Manager", "Accountant"]
                    .filter((r) => !roleSummaries.some((item) => item.name === r))
                    .map((missingRole) => (
                        <article key={missingRole} className="rounded-2xl bg-white p-4 shadow-sm opacity-70">
                            <div className="mt-2 flex items-end justify-between">
                                <h3 className="text-xl font-semibold">{missingRole}</h3>
                                <span className="text-3xl font-bold text-[#94A3B8]">0</span>
                            </div>
                        </article>
                    ))}
            </section>

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
                                <th className="px-4 py-3 font-medium">Phone</th>
                                <th className="px-4 py-3 font-medium text-right">Edit</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E8F0]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={`${user.employeeCode}-${user.userId}`} className="hover:bg-[#F1F5F9]">
                                        <td className="whitespace-nowrap px-4 py-3 font-medium">{user.userId}</td>
                                        <td className="whitespace-nowrap px-4 py-3 font-medium">{user.employeeCode}</td>
                                        <td className="whitespace-nowrap px-4 py-3 font-medium">{user.fullName}</td>
                                        <td className="whitespace-nowrap px-4 py-3">{user.roleName}</td>
                                        <td className="whitespace-nowrap px-4 py-3">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.status === 1 || user.status === "Hoạt động"
                                    ? "bg-[#DCFCE7] text-[#15803D]"
                                    : "bg-[#FEE2E2] text-[#B91C1C]"
                            }`}
                        >
                          {user.status === 1 || user.status === "Hoạt động" ? "Hoạt động" : "Tạm khóa"}
                        </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-[#557099]">{user.phoneNo}</td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser(user);
                                                        setOpenEdit(true);
                                                    }}
                                                    className="mr-2 rounded-full border border-[#CBD5E1] p-2 text-[#475569] transition hover:border-[#4AB4DE] hover:text-[#4AB4DE]"
                                                >
                                                    <Pencil className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {openCreate && (
                <CreateAccountModal
                    onClose={() => setOpenCreate(false)}
                    onSubmit={async () => {
                        setOpenCreate(false);
                        await reloadUsers();
                    }}
                />
            )}

            {openEdit && editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setOpenEdit(false)}
                    onSubmit={async (data) => {
                        const token = localStorage.getItem("access_token") ?? "";

                        const roleMap: Record<string, number> = {
                            Admin: 1,
                            HR: 2,
                            Employee: 3,
                            Manager: 4,
                            Accountant: 5,
                        };

                        const payload = {
                            employeeCode: editingUser.employeeCode, // PK
                            userId: editingUser.userId,            // giữ nguyên ID máy chấm công
                            fullName: data.name,
                            email: data.email,
                            phoneNo: data.phone,
                            status: data.status === "Hoạt động" ? 1 : 0,
                            roleId: roleMap[data.role] ?? 3,
                        };

                        const res = await fetch(`${API_BASE}/api/v1/admin/users/${editingUser.employeeCode}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(payload),
                        });

                        const json = await res.json();
                        if (!res.ok || json.status !== 200) {
                            alert(json.message || "Cập nhật thất bại");
                            return;
                        }

                        setOpenEdit(false);
                        await reloadUsers();
                    }}
                />
            )}
        </div>
    );
}

/* ------------ CREATE MODAL ------------ */
function CreateAccountModal({
                                onClose,
                                onSubmit,
                            }: {
    onClose: () => void;
    onSubmit: () => void;
}) {
    const [employeeCode, setEmployeeCode] = useState("");
    const [userId, setUserId] = useState(""); // NEW
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("EMPLOYEE");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("access_token");
            const payload = {
                employeeCode, // PK
                userId,       // NEW: ID máy chấm công
                fullName: name,
                username,
                password,
                email,
                phoneNo: phone,
                roleId: role === "ADMIN" ? 1 : role === "HR" ? 2 : role === "EMPLOYEE" ? 3 : role === "MANAGER" ? 4 : 5,
                status: 1,
                dob: "2000-01-01",
            };

            const res = await fetch(`${API_BASE}/api/v1/admin/create-account`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token ?? ""}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok || json.status !== 200) {
                alert(json.message || "Tạo tài khoản thất bại!");
                return;
            }

            alert("✅ Tạo tài khoản thành công!");
            onSubmit();
            onClose();
        } catch (err) {
            console.error("Lỗi khi tạo tài khoản:", err);
            alert("Đã xảy ra lỗi khi tạo tài khoản!");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-lg font-semibold text-[#1F2A44]">Tạo tài khoản</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#1F2A44]"
                    >
                        <X className="h-5 w-5"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    {/* UserID (máy chấm công) */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">UserID</label>
                        <input
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="VD: 51"
                        />
                    </div>

                    {/* EmployeeCode (PK) */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">EmployeeCode</label>
                        <input
                            value={employeeCode}
                            onChange={(e) => setEmployeeCode(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="VD: SC0001"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="vd: Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="vd: an.nguyen"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                        >
                            <option value="HR">HR</option>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ACCOUNTANT">Accountant</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Phone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="vd: 0987654321"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#1F2A44] hover:bg-[#F8FAFC]"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#4AB4DE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3c9ec3]"
                        >
                            Tạo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ------------ EDIT MODAL ------------ */
function EditUserModal({
                           user,
                           onClose,
                           onSubmit,
                       }: {
    user: UserItem;
    onClose: () => void;
    onSubmit: (data: {
        id: string;
        name: string;
        role: string;
        status: "Hoạt động" | "Tạm khóa";
        phone: string;
        email: string;
    }) => void;
}) {
    const [name, setName] = useState(user.fullName);
    const [role, setRole] = useState<string>(user.roleName ?? "");
    const [status, setStatus] = useState<"Hoạt động" | "Tạm khóa">(
        user.status === 1 || user.status === "Hoạt động" ? "Hoạt động" : "Tạm khóa"
    );
    const [phone, setPhone] = useState(user.phoneNo ?? "");
    const [email, setEmail] = useState(user.email ?? "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            id: user.employeeCode, // dùng PK để update ở FE cha
            name,
            role,
            status,
            phone,
            email,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-lg font-semibold text-[#1F2A44]">Chỉnh sửa tài khoản</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#1F2A44]"
                    >
                        <X className="h-5 w-5"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    {/* UserID (view only) */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">UserID</label>
                        <input
                            value={user.userId}
                            disabled
                            className="w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#64748B]"
                        />
                    </div>

                    {/* EmployeeCode (view only) */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">EmployeeCode (PK)</label>
                        <input
                            value={user.employeeCode}
                            disabled
                            className="w-full cursor-not-allowed rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#64748B]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="Nhập tên nhân viên"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Position</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                        >
                            <option value="Admin">Admin</option>
                            <option value="HR">HR</option>
                            <option value="Manager">Manager</option>
                            <option value="Employee">Employee</option>
                            <option value="Accountant">Accountant</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as "Hoạt động" | "Tạm khóa")}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                        >
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Tạm khóa">Tạm khóa</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Phone</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="SĐT"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1F2A44]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#4AB4DE]"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm text-[#1F2A44] hover:bg-[#F8FAFC]"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#4AB4DE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3c9ec3]"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
