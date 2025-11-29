"use client";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { EmployeePayrollRow } from "@/app/_components/employee/payroll/types";
import { useNotification } from "@/app/_components/common/pop-box/notification/notification-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function PayrollPage() {
  const router = useRouter();
  const { addNotification } = useNotification();
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

  const handleDownload = async (employeeCode: string, month: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}/api/paysummaries/download?employeeCode=${employeeCode}&month=${month}-01`,
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
    <div className="relative flex min-h-full flex-col gap-6 text-[#1F2A44] pr-5">
      <div className="p-6">
        <button className="border border-black bg-[#79deeb] text-[#4577a0] py-2 px-4 rounded hover:bg-[#49bee1] cursor-pointer" onClick={() => router.back()}>Quay lại</button>
      </div>

      <div className=" w-full h-full border border-black rounded-lg bg-[#E6F7FF]">
        <div className="flex flex-row items-center mb-5 p-5">
          <span className="text-2xl font-bold">Lương nhân viên</span>
          <div className="ml-auto mr-4 border border-gray-300 rounded px-2 py-1 bg-white">
            <Calendar className="inline-block mr-2"/>
            <input 
              placeholder="Year" 
              className="focus:outline-none w-24" 
              type="number" 
              value={year}
              onChange={handleYearChange}
            />
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-10">
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && payrollData.length > 0 && (
          <div className="overflow-x-auto rounded-b-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#4AB4DE] text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">Thời gian</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Công chuẩn</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Công thực tế</th>
                  <th className="border border-gray-300 px-4 py-3 text-right">Lương thực nhận</th>
                  <th className="border border-gray-300 px-4 py-3 text-center">Phiếu lương</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((row, index) => (
                  <tr 
                    key={index} 
                    className="bg-white hover:bg-gray-50 transition-colors"
                  >
                    <td className="border border-gray-300 px-4 py-3">{row.month}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">{row.dayStandard}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right">{row.daysPayable}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                      {formatCurrency(row.netSalary)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      {row.hasPayslip ? (
                        <button 
                          className="rounded border border-blue-800 bg-[#89cdfe] text-blue-800 p-3 hover:bg-[#6bb8e8] transition-colors"
                          onClick={() => handleDownload(row.employeeCode, row.month)}
                        >
                          Tải về
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && payrollData.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600">Không có dữ liệu lương cho năm {year}</p>
          </div>
        )}
      </div>
    </div>
  );
}