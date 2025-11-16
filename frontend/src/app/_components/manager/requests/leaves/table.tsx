"use client";

import { useContext, useEffect } from "react";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { ParamsContext, DataContext } from "./context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function ManagerLeavesTable() {
  const { params, setParams } = useContext(ParamsContext)!;
  const { leaves, setLeaves, loading, setLoading } = useContext(DataContext)!;

  useEffect(() => {
    async function fetchLeaves() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const queryParams = new URLSearchParams({
          month: params.date.split("-")[1],
          year: params.date.split("-")[0],
          indexPage: params.indexPage.toString(),
          maxItems: params.maxItems.toString(),
          keyword: params.keyword || "",
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
    <div className="w-full h-fit my-5 border border-black rounded-lg shadow-md">
      <div className="flex flex-row p-5">
        <span className="text-2xl font-semibold">Danh sách nghỉ phép</span>
        <input 
          type="month" 
          value={params.date} 
          onChange={(e) => setParams((prev) => ({ ...prev, date: e.target.value }))}
          className="ml-auto border rounded-2xl border-gray-700 px-3 py-1" 
        />
      </div>
      <div className="w-full h-[calc(100%-72px)] overflow-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left">Họ và tên</th>
              <th className="px-4 py-2 text-center">Thời gian gửi yêu cầu</th>
              <th className="px-4 py-2 text-center">Thời gian bắt đầu</th>
              <th className="px-4 py-2 text-center">Thời gian nghỉ</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-left">Lí do</th>
              <th className="px-4 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-left">
                    <span>{leave.fullName}</span><br />
                    <span className="text-sm">{leave.employeeCode}</span>
                  </td>
                  <td className="px-4 py-2 text-center">{leave.createDate ? new Date(leave.createDate).toLocaleDateString('vi-VN') : '-'}</td>
                  <td className="px-4 py-2 text-center">{new Date(leave.fromDate).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-2 text-center">
                    {(() => {
                      const days = Math.ceil((new Date(leave.toDate).getTime() - new Date(leave.fromDate).getTime()) / (1000 * 60 * 60 * 24));
                      return days === 0 ? 1 : days;
                    })()} ngày
                  </td>
                  <td className={`px-4 py-2 text-center font-semibold ${getStatusColor(leave.status)}`}>
                    {getStatusText(leave.status)}
                  </td>
                  <td className="px-4 py-2 text-left">{leave.reason}</td>
                  <td className="px-4 py-2 text-center">
                    <a href={`/manager/requests/leaves/approval?id=${leave.id}`} className="cursor-pointer">
                      <Info />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end align-middle my-5 mr-5">
        <button className="cursor-pointer" onClick={() => changePageHandler("first")}><ChevronFirst /></button>
        <button className="cursor-pointer" onClick={() => changePageHandler("prev")}><ChevronLeft /></button>
        <span className="mx-2">Page {params.indexPage + 1} of {params.totalPages ?? 1}</span>
        <button className="cursor-pointer" onClick={() => changePageHandler("next")}><ChevronRight /></button>
        <button className="cursor-pointer" onClick={() => changePageHandler("last")}><ChevronLast /></button>
      </div>
    </div>
  );
}