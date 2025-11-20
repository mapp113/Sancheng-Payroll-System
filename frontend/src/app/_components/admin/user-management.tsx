"use client";

import {Pencil, Plus, Search, X} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

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

type RawUserItem = UserItem & {
    userID?: string;
};

const normalizeUser = (user: RawUserItem): UserItem => ({
    ...user,
    userId: user.userId ?? user.userID ?? "", // fallback nếu BE trả tên khác
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function UserManagement() {
    const [filterRole, setFilterRole] = useState<string>("all");
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");


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

                // Chuẩn hóa để tương thích tên field từ BE
                const data: UserItem[] = (json.data ?? []).map((u: RawUserItem) => normalizeUser(u));
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

    return (
        <div className="flex h-full flex-col gap-4 p-4 text-[#1F2A44]">
            <header className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Account Management</h1>
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
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>)

}