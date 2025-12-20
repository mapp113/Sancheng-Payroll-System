"use client";

import { useContext, useEffect } from "react";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { ParamsContext, DataContext } from "./context";
import { vietnameseToLeaveStatusCode } from "../../../utils/statusMapping";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

interface ManagerLeavesTableProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
}

export function ManagerLeavesTable({ searchInput, setSearchInput }: ManagerLeavesTableProps) {
  const { params, setParams } = useContext(ParamsContext)!;
  const { leaves, setLeaves, loading, setLoading } = useContext(DataContext)!;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // Giữ nguyên giá trị user nhập vào, chỉ convert khi gọi API
    setParams((prev) => ({ ...prev, keyword: value, indexPage: 0 }));
  };

  useEffect(() => {
    async function fetchLeaves() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        // Chỉ convert sang status code khi gọi API
        const apiKeyword = vietnameseToLeaveStatusCode(params.keyword || "");
        const queryParams = new URLSearchParams({
          month: params.date.split("-")[1],
          year: params.date.split("-")[0],
          indexPage: params.indexPage.toString(),
          maxItems: params.maxItems.toString(),
          keyword: apiKeyword,
        });

        const response = await fetch(`${API_BASE_URL}/api/leave/all?${queryParams}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch leaves");
        }

        const data = await response.json();
        setLeaves(data.content);
        setParams((prev) => ({ ...prev, totalPages: data.totalPages }));
      } catch (error) {
        console.error("Error fetching leaves:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.date, params.indexPage, params.maxItems, params.keyword]);

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600";
      case "APPROVED":
        return "text-green-600";
      case "REJECTED":
        return "text-red-600";
      default:
        return "";
    }
  };

  const changePageHandler = (dir: "first" | "last" | "next" | "prev") => {
    setParams((prev) => {
      let newIndexPage = prev.indexPage;
      if (dir === "first") newIndexPage = 0;
      else if (dir === "last" && prev.totalPages !== undefined) newIndexPage = prev.totalPages - 1;
      else if (dir === "next" && (prev.totalPages === undefined || prev.indexPage < prev.totalPages - 1)) newIndexPage = prev.indexPage + 1;
      else if (dir === "prev" && prev.indexPage > 0) newIndexPage = prev.indexPage - 1;
      return { ...prev, indexPage: newIndexPage };
    });
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-[#94A3B8]" />
            <input
              placeholder="Tìm kiếm"
              className="w-full rounded-full border border-[#E2E8F0] py-2 pl-9 pr-3 text-sm focus:border-[#4AB4DE] focus:outline-none"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border border-[#E2E8F0] px-3 py-2">
            <input
              type="month"
              value={params.date}
              onChange={(e) => setParams((prev) => ({ ...prev, date: e.target.value }))}
              className="focus:outline-0 text-sm bg-transparent"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto rounded-2xl border border-[#E2E8F0]">
        <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
          <thead className="bg-[#F8FAFC] text-left sticky top-0">
            <tr>
              <th className="px-4 py-3 font-medium">Nhân viên</th>
              <th className="px-4 py-3 font-medium text-center">Thời gian gửi yêu cầu</th>
              <th className="px-4 py-3 font-medium text-center">Thời gian bắt đầu</th>
              <th className="px-4 py-3 font-medium text-center">Thời gian nghỉ</th>
              <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Lí do</th>
              <th className="px-4 py-3 font-medium text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                  Đang tải...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-[#F1F5F9]">
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-medium">{leave.fullName}</span><br />
                    <span className="text-xs text-slate-500">{leave.employeeCode}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">{leave.createDate ? new Date(leave.createDate).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">{new Date(leave.fromDate).toLocaleDateString('vi-VN')}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {(() => {
                      const days = Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24));
                      return days === 0 ? 1 : days;
                    })()} ngày
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-center font-semibold ${getStatusColor(leave.status)}`}>
                    {getStatusText(leave.status)}
                  </td>
                  <td className="px-4 py-3">{leave.reason}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <a href={`/manager/requests/leaves/approval?id=${leave.id}&page=${params.indexPage}&month=${params.date}${params.keyword ? `&search=${encodeURIComponent(params.keyword)}` : ''}`} className="inline-block rounded-full border border-[#4AB4DE] px-4 py-1 text-xs font-medium text-[#4AB4DE] hover:bg-[#E0F2FE] cursor-pointer">
                      Chi tiết
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && leaves.length > 0 && (
        <div className="flex justify-end items-center gap-2 mt-4 text-sm">
          <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("first")} disabled={params.indexPage === 0}><ChevronFirst className="h-4 w-4" /></button>
          <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("prev")} disabled={params.indexPage === 0}><ChevronLeft className="h-4 w-4" /></button>
          <span className="px-3 text-slate-600">Trang {params.indexPage + 1} / {params.totalPages ?? 1}</span>
          <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("next")} disabled={params.indexPage >= (params.totalPages ?? 1) - 1}><ChevronRight className="h-4 w-4" /></button>
          <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("last")} disabled={params.indexPage >= (params.totalPages ?? 1) - 1}><ChevronLast className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}