"use client"

import { getUserMeta } from "@/app/_components/utils/getUserData";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OvertimeBalancePopup from "@/app/_components/manager/requests/overtime/overtime-balance-popup";
import { OTResponseData } from "@/app/_components/employee/request/types";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Info } from "lucide-react";

export default function OvertimePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Khôi phục state từ URL params
  const [otRequests, setOtRequests] = useState<OTResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get("month") || new Date().toISOString().slice(0, 7)
  );
  const [indexPage, setIndexPage] = useState(
    parseInt(searchParams.get("page") || "0")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [keyword, setKeyword] = useState(
    searchParams.get("search") || ""
  );
  const maxItems = 10;
  const [showOvertimePopup, setShowOvertimePopup] = useState(false);

  useEffect(() => {
    if (getUserMeta("role") !== "MANAGER" && getUserMeta("role") !== "HR") {
      window.location.href = "/login";
    }
  }, []);

  // Cập nhật URL params khi state thay đổi
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", indexPage.toString());
    params.set("month", selectedMonth);
    if (keyword) {
      params.set("search", keyword);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [indexPage, selectedMonth, keyword, router]);

  useEffect(() => {
    async function fetchOTRequests() {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("scpm.auth.token");
        const queryParams = new URLSearchParams({
          page: indexPage.toString(),
          size: maxItems.toString(),
        });

        if (selectedMonth) {
          queryParams.append("month", selectedMonth.split("-")[1]);
          queryParams.append("year", selectedMonth.split("-")[0]);
        }

        if (keyword) {
          queryParams.append("keyword", keyword);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/all?${queryParams}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOtRequests(data.content || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching OT requests:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOTRequests();
  }, [selectedMonth, indexPage, keyword]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setKeyword(searchInput);
      setIndexPage(0);
    }
  };

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
    let newIndexPage = indexPage;
    if (dir === "first") newIndexPage = 0;
    else if (dir === "last") newIndexPage = totalPages - 1;
    else if (dir === "next" && indexPage < totalPages - 1) newIndexPage = indexPage + 1;
    else if (dir === "prev" && indexPage > 0) newIndexPage = indexPage - 1;
    setIndexPage(newIndexPage);
  };

  const filteredRequests = otRequests;
  
  return (
    <div className="w-full p-4">
      <div>
        <input 
          className="border border-black rounded-2xl px-4 py-2" 
          placeholder="Tìm kiếm" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <button
          onClick={() => setShowOvertimePopup(true)}
          className="ml-4 bg-[#88ccfd] text-blue-900 px-4 py-2 rounded hover:bg-[#4cb4fe] transition-colors cursor-pointer"
        >
          Quản lí thời gian overtime
        </button>
      </div>
      <hr className="my-4 border-black" />
      <div className="w-full h-fit border border-black rounded-2xl py-4">
        <div className="flex flex-row px-4 mb-4">
          <h1 className="text-2xl font-bold">Danh sách xin Overtime</h1>
          <input 
            type="month" 
            className="ml-auto border border-black rounded-xl p-1" 
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setIndexPage(0);
            }}
          />
        </div>
        <div className="w-full h-[calc(100%-56px)] overflow-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Họ và tên</th>
                <th className="px-4 py-2 text-center">Thời gian gửi yêu cầu</th>
                <th className="px-4 py-2 text-center">Thời gian Overtime</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-left">Lí do</th>
                <th className="px-4 py-2 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-left">
                      <div>{request.fullName}</div>
                      <div>{request.employeeCode}</div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {new Date(request.createdDateOT).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {request.fromTime.substring(11, 16)} - {request.toTime.substring(11, 16)}
                    </td>
                    <td className={`px-4 py-2 text-center font-semibold ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </td>
                    <td className="px-4 py-2 text-left">{request.reason}</td>
                    <td className="px-4 py-2 text-center">
                      <a 
                        className="hover:underline cursor-pointer" 
                        href={`/manager/requests/overtime/approval?id=${request.id}&page=${indexPage}&month=${selectedMonth}${keyword ? `&search=${encodeURIComponent(keyword)}` : ''}`}
                      >
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
          <span className="mx-2">Page {indexPage + 1} of {totalPages}</span>
          <button className="cursor-pointer" onClick={() => changePageHandler("next")}><ChevronRight /></button>
          <button className="cursor-pointer" onClick={() => changePageHandler("last")}><ChevronLast /></button>
        </div>
      </div>
      {showOvertimePopup && (
        <OvertimeBalancePopup onClose={() => setShowOvertimePopup(false)} />
      )}
    </div>
  );
}