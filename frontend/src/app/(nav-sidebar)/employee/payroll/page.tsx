"use client";
import {Calendar} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect, useState, useCallback} from "react";
import {EmployeePayrollRow} from "@/app/_components/employee/payroll/types";
import {useNotification} from "@/app/_components/common/pop-box/notification/notification-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

export default function PayrollPage() {
    const router = useRouter();
    const {addNotification} = useNotification();
    const [year, setYear] = useState<string>(new Date().getFullYear().toString());
    const [payrollData, setPayrollData] = useState<EmployeePayrollRow[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const fetchPayrollData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(
                `${API_BASE_URL}/api/employee/payroll?year=${year}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch payroll data");
            }

            const data: EmployeePayrollRow[] = await response.json();
            setPayrollData(data);
        } catch (error) {
            console.error("Error fetching payroll data:", error);
            setError("Không thể tải dữ liệu lương");
            setPayrollData([]);
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        if (year) {
            fetchPayrollData();
        }
    }, [year, fetchPayrollData]);

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setYear(e.target.value);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatMonth = (dateString: string) => {
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${year}`;
    };

    const handleDownload = async (employeeCode: string, month: string) => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(
                `${API_BASE_URL}/api/paysummaries/download?employeeCode=${employeeCode}&month=${month}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download payslip");
            }

            // Get filename from header or use default
            const contentDisposition = response.headers.get("Content-Disposition");
            let filename = `payslip_${employeeCode}_${month}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/i);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            addNotification("ok", "Thành công", "Tải phiếu lương thành công", 3000);
        } catch (error) {
            console.error("Error downloading payslip:", error);
            addNotification("error", "Lỗi", "Không thể tải phiếu lương. Vui lòng thử lại.", 5000);
        }
    };

    return (
        <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
                <header className="flex flex-col gap-3 border-b border-[#CCE1F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-[#1F2A44]">Lương Nhân Viên</h3>
                        <p className="text-sm text-[#1F2A44]/60">
                            Theo dõi lương và phiếu lương của bạn
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#4AB4DE] bg-white px-4 py-2">
                        <Calendar className="h-4 w-4 text-[#4AB4DE]" />
                        <input
                            placeholder="Năm"
                            className="w-20 text-sm font-medium text-[#1F2A44] outline-none"
                            type="number"
                            value={year}
                            onChange={handleYearChange}
                        />
                    </div>
                </header>

                {loading && (
                    <div className="mt-6 flex items-center justify-center py-8">
                        <p className="text-[#1F2A44]/60">Đang tải dữ liệu...</p>
                    </div>
                )}

                {error && (
                    <div className="mt-6 flex items-center justify-center py-8">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {!loading && !error && payrollData.length > 0 && (
                    <div className="mt-6 overflow-hidden rounded-xl border border-[#CCE1F0]">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gradient-to-r from-[#4AB4DE] to-[#5cc6ef] text-white">
                                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-left font-semibold">Thời gian</th>
                                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-right font-semibold">Công chuẩn</th>
                                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-right font-semibold">Công thực tế</th>
                                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-right font-semibold">Lương thực nhận</th>
                                <th className="border-b border-[#CCE1F0] px-4 py-3 text-center font-semibold">Phiếu lương</th>
                            </tr>
                            </thead>
                            <tbody>
                            {payrollData.filter(row => row.netSalary).length > 0 ? (
                                payrollData.filter(row => row.netSalary).map((row, index, arr) => (
                                    <tr
                                        key={index}
                                        className="bg-white transition-colors hover:bg-[#F4FBFF]"
                                    >
                                        <td className={`px-4 py-3 text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{formatMonth(row.month)}</td>
                                        <td className={`px-4 py-3 text-right text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{row.dayStandard}</td>
                                        <td className={`px-4 py-3 text-right text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{row.daysPayable}</td>
                                        <td className={`px-4 py-3 text-right font-semibold text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>
                                            {formatCurrency(row.netSalary)}
                                        </td>
                                        <td className={`px-4 py-3 text-center ${index < arr.length - 1 ? 'border-b border-[#CCE1F0]' : ''}`}>
                                            {(row.hasPayslip) ? (
                                                <button
                                                    className="cursor-pointer rounded-full border border-[#4AB4DE] bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3ba1ca]"
                                                    onClick={() => handleDownload(row.employeeCode, row.month)}
                                                >
                                                    Tải về
                                                </button>
                                            ) : (
                                                <span className="text-[#1F2A44]/40">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-[#1F2A44]/60">
                                        Không có dữ liệu lương cho năm {year}
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !error && payrollData.length === 0 && (
                    <div className="mt-6 flex items-center justify-center py-8">
                        <p className="text-[#1F2A44]/60">Không có dữ liệu lương cho năm {year}</p>
                    </div>
                )}
            </section>
        </div>
    );
}