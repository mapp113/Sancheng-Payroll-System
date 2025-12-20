"use client"

import { getUserMeta } from "@/app/_components/utils/getUserData";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OvertimeBalancePopup from "@/app/_components/manager/requests/overtime/overtime-balance-popup";
import { OTResponseData } from "@/app/_components/employee/request/types";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { vietnameseToLeaveStatusCode } from "@/app/_components/utils/statusMapping";

function OvertimeContent() {
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
          // Chỉ convert sang status code khi gọi API
          const apiKeyword = vietnameseToLeaveStatusCode(keyword);
          queryParams.append("keyword", apiKeyword);
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

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // Giữ nguyên giá trị user nhập vào, chỉ convert khi gọi API
    setKeyword(value);
    setIndexPage(0);
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
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Danh Sách Xin Overtime</h1>
          <button
            onClick={() => setShowOvertimePopup(true)}
            className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a9bc5] transition-colors cursor-pointer"
          >
            Quản lí thời gian overtime
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
        <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm flex flex-col">
          <div className="flex-1 overflow-hidden">
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
                      value={selectedMonth}
                      onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setIndexPage(0);
                      }}
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
                      <th className="px-4 py-3 font-medium text-center">Thời gian Overtime</th>
                      <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                      <th className="px-4 py-3 font-medium">Lí do</th>
                      <th className="px-4 py-3 font-medium text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                          Đang tải...
                        </td>
                      </tr>
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-[#F1F5F9]">
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="font-medium">{request.fullName}</span><br />
                            <span className="text-xs text-slate-500">{request.employeeCode}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            {new Date(request.createdDateOT).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            {request.fromTime.substring(11, 16)} - {request.toTime.substring(11, 16)}
                          </td>
                          <td className={`whitespace-nowrap px-4 py-3 text-center font-semibold ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </td>
                          <td className="px-4 py-3">{request.reason}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-center">
                            <a
                              className="inline-block rounded-full border border-[#4AB4DE] px-4 py-1 text-xs font-medium text-[#4AB4DE] hover:bg-[#E0F2FE] cursor-pointer"
                              href={`/manager/requests/overtime/approval?id=${request.id}&page=${indexPage}&month=${selectedMonth}${keyword ? `&search=${encodeURIComponent(keyword)}` : ''}`}
                            >
                              Chi tiết
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!loading && filteredRequests.length > 0 && (
                <div className="flex justify-end items-center gap-2 mt-4 text-sm">
                  <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("first")} disabled={indexPage === 0}><ChevronFirst className="h-4 w-4" /></button>
                  <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("prev")} disabled={indexPage === 0}><ChevronLeft className="h-4 w-4" /></button>
                  <span className="px-3 text-slate-600">Trang {indexPage + 1} / {totalPages}</span>
                  <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("next")} disabled={indexPage >= totalPages - 1}><ChevronRight className="h-4 w-4" /></button>
                  <button className="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors" onClick={() => changePageHandler("last")} disabled={indexPage >= totalPages - 1}><ChevronLast className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {showOvertimePopup && (
        <OvertimeBalancePopup onClose={() => setShowOvertimePopup(false)} />
      )}
    </div>
  );
}

export default function OvertimePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OvertimeContent />
    </Suspense>
  );
}