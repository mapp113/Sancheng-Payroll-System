"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import FormPopBoxNotScroll from "@/app/_components/common/pop-box/form";
import {OvertimeSummaryResponse} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface OvertimeBalancePopupProps {
  onClose: () => void;
}



export default function OvertimeBalancePopup({ onClose }: OvertimeBalancePopupProps) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState<OvertimeSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!employeeCode.trim()) {
      setError("Vui lòng nhập mã nhân viên");
      return;
    }

    if (!year.trim() || isNaN(Number(year))) {
      setError("Vui lòng nhập năm hợp lệ");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_BASE_URL}/api/overtime-balance/summary?employeeCode=${encodeURIComponent(employeeCode)}&year=${year}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không tìm thấy dữ liệu");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError("Không tìm thấy dữ liệu cho nhân viên này");
      console.error("Error fetching overtime balance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <FormPopBoxNotScroll>
      <div className="w-[600px] max-w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1D3E6A]">Tra cứu thời gian Overtime</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên</label>
              <input
                type="text"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập mã nhân viên"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-[#88ccfd] hover:bg-[#4cb4fe] text-blue-900 font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2  cursor-pointer"
          >
            <Search className="w-4 h-4" />
            {loading ? "Đang tìm kiếm..." : "Tra cứu"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {data && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="mb-4 pb-4 border-b border-gray-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã nhân viên</p>
                  <p className="font-semibold text-[#1D3E6A]">{data.employeeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tên nhân viên</p>
                  <p className="font-semibold text-[#1D3E6A]">{data.employeeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Năm</p>
                  <p className="font-semibold text-[#1D3E6A]">{data.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng năm</p>
                  <p className="font-semibold text-[#1D3E6A]">{data.totalOvertime}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#b8e9f7]">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-[#1D3E6A] border border-gray-300">Tháng</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-[#1D3E6A] border border-gray-300">Giờ OT</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthly.map((m) => (
                    <tr key={m.month} className={m.month % 2 === 0 ? "bg-white" : "bg-[#f8fcff]"}>
                      <td className="px-3 py-2 text-sm text-[#1D3E6A] border border-gray-300">{m.month}</td>
                      <td className="px-3 py-2 text-sm text-[#1D3E6A] text-right border border-gray-300">{m.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </FormPopBoxNotScroll>
  );
}
