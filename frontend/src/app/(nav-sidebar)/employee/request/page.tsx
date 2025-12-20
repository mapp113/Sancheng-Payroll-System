"use client";

import LeavesToolBar from "@/app/_components/employee/request/tool-bar";
import { useEffect, useState } from "react";
import { LeaveResponseData, OTResponseData } from "@/app/_components/employee/request/types";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Info } from "lucide-react";

export default function LeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveResponseData[]>([]);
  const [otRequests, setOtRequests] = useState<OTResponseData[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [otLoading, setOtLoading] = useState(true);
  const [remainingLeave, setRemainingLeave] = useState<number | null>(null);
  const [remainingOT, setRemainingOT] = useState<number | null>(null);

  // Pagination states for leave
  const [leaveIndexPage, setLeaveIndexPage] = useState(0);
  const [leaveTotalPages, setLeaveTotalPages] = useState(1);
  const leaveMaxItems = 5;

  // Pagination states for OT
  const [otIndexPage, setOtIndexPage] = useState(0);
  const [otTotalPages, setOtTotalPages] = useState(1);
  const otMaxItems = 5;

  useEffect(() => {
    async function fetchLeaveData() {
      setLeaveLoading(true);
      try {
        const token = sessionStorage.getItem("scpm.auth.token");

        // Fetch leave requests with pagination
        const queryParams = new URLSearchParams({
          page: leaveIndexPage.toString(),
          size: leaveMaxItems.toString(),
        });

        const requestsResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/myrequest?${queryParams}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setLeaveRequests(requestsData.content);
          setLeaveTotalPages(requestsData.totalPages || 1);
        }

        // Fetch remaining leave (only once)
        if (leaveIndexPage === 0) {
          const remainingResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/remainingLeave`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (remainingResponse.ok) {
            const remainingData = await remainingResponse.json();
            setRemainingLeave(remainingData);
          }
        }
      } catch (error) {
        console.error("Error fetching leave data:", error);
      } finally {
        setLeaveLoading(false);
      }
    }

    fetchLeaveData();
  }, [leaveIndexPage]);

  useEffect(() => {
    async function fetchOTData() {
      setOtLoading(true);
      try {
        const token = sessionStorage.getItem("scpm.auth.token");

        // Fetch OT requests with pagination
        const queryParams = new URLSearchParams({
          page: otIndexPage.toString(),
          size: otMaxItems.toString(),
        });

        const otRequestsResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/myrequest?${queryParams}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (otRequestsResponse.ok) {
          const otRequestsData = await otRequestsResponse.json();
          setOtRequests(otRequestsData.content);
          setOtTotalPages(otRequestsData.totalPages || 1);
        }

        // Fetch remaining OT (only once)
        if (otIndexPage === 0) {
          const remainingOTResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/remaining-month`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (remainingOTResponse.ok) {
            const remainingOTData = await remainingOTResponse.json();
            setRemainingOT(remainingOTData);
          }
        }
      } catch (error) {
        console.error("Error fetching OT data:", error);
      } finally {
        setOtLoading(false);
      }
    }

    fetchOTData();
  }, [otIndexPage]);

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

  const changeLeavePageHandler = (dir: "first" | "last" | "next" | "prev") => {
    let newIndexPage = leaveIndexPage;
    if (dir === "first") newIndexPage = 0;
    else if (dir === "last") newIndexPage = leaveTotalPages - 1;
    else if (dir === "next" && leaveIndexPage < leaveTotalPages - 1) newIndexPage = leaveIndexPage + 1;
    else if (dir === "prev" && leaveIndexPage > 0) newIndexPage = leaveIndexPage - 1;
    setLeaveIndexPage(newIndexPage);
  };

  const changeOTPageHandler = (dir: "first" | "last" | "next" | "prev") => {
    let newIndexPage = otIndexPage;
    if (dir === "first") newIndexPage = 0;
    else if (dir === "last") newIndexPage = otTotalPages - 1;
    else if (dir === "next" && otIndexPage < otTotalPages - 1) newIndexPage = otIndexPage + 1;
    else if (dir === "prev" && otIndexPage > 0) newIndexPage = otIndexPage - 1;
    setOtIndexPage(newIndexPage);
  };

  return (
    <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
      <LeavesToolBar />
      
      {/* Leave Requests Section */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-3 border-b border-[#CCE1F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#1F2A44]">Yêu cầu Xin Nghỉ</h3>
            <p className="text-sm text-[#1F2A44]/60">
              Danh sách các yêu cầu nghỉ phép của bạn
            </p>
          </div>
          <div className="rounded-full border border-[#4AB4DE] bg-[#F4FBFF] px-4 py-2">
            <span className="text-sm text-[#1F2A44]/80">Số ngày nghỉ còn lại: </span>
            <span className="font-semibold text-[#4AB4DE]">{remainingLeave !== null ? remainingLeave : "..."}</span>
          </div>
        </header>

        <div className="mt-6 overflow-hidden rounded-xl border border-[#CCE1F0]">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="bg-gradient-to-r from-[#4AB4DE] to-[#5cc6ef] text-white">
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-left font-semibold">STT</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Ngày bắt đầu</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Ngày kết thúc</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Loại nghỉ</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Thông báo</th>
                <th className="border-b border-[#CCE1F0] px-4 py-3 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {leaveLoading ? (
                <tr key="loading">
                  <td colSpan={7} className="px-4 py-10 text-center text-[#1F2A44]/60">
                    Đang tải...
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr key="empty">
                  <td colSpan={7} className="px-4 py-10 text-center text-[#1F2A44]/60">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request, index, arr) => (
                  <tr key={`${request.id}`} className="bg-white transition-colors hover:bg-[#F4FBFF]">
                    <td className={`px-4 py-3 text-left text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{index + 1}</td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>
                      {new Date(request.fromDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>
                      {new Date(request.toDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{request.leaveTypeCode}</td>
                    <td className={`px-4 py-3 text-left font-semibold ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'} ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] max-w-xs overflow-auto ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{request.note || ""}</td>
                    <td className={`px-4 py-3 text-center ${index < arr.length - 1 ? 'border-b border-[#CCE1F0]' : ''}`}>
                      <a className="inline-flex items-center gap-1 text-[#4AB4DE] hover:text-[#3ba1ca] cursor-pointer" href={`/employee/request/leave-detail?id=${request.id}`}>
                        <Info className="h-5 w-5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-end gap-2">
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeLeavePageHandler("first")}
            disabled={leaveIndexPage === 0}
          >
            <ChevronFirst className="h-5 w-5" />
          </button>
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeLeavePageHandler("prev")}
            disabled={leaveIndexPage === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="mx-2 text-sm text-[#1F2A44]">Trang {leaveIndexPage + 1} trên {leaveTotalPages}</span>
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeLeavePageHandler("next")}
            disabled={leaveIndexPage >= leaveTotalPages - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeLeavePageHandler("last")}
            disabled={leaveIndexPage >= leaveTotalPages - 1}
          >
            <ChevronLast className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* OT Requests Section */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-3 border-b border-[#CCE1F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#1F2A44]">Yêu cầu Overtime</h3>
            <p className="text-sm text-[#1F2A44]/60">
              Danh sách các yêu cầu làm thêm giờ của bạn
            </p>
          </div>
          <div className="rounded-full border border-[#4AB4DE] bg-[#F4FBFF] px-4 py-2">
            <span className="text-sm text-[#1F2A44]/80">Số giờ đã OT trong tháng: </span>
            <span className="font-semibold text-[#4AB4DE]">{remainingOT !== null ? remainingOT : "..."}</span>
          </div>
        </header>

        <div className="mt-6 overflow-hidden rounded-xl border border-[#CCE1F0]">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="bg-gradient-to-r from-[#4AB4DE] to-[#5cc6ef] text-white">
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-left font-semibold">STT</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Ngày OT</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Giờ bắt đầu</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Giờ kết thúc</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Số giờ OT</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="border-b border-r border-[#CCE1F0] px-4 py-3 text-center font-semibold">Thông báo</th>
                <th className="border-b border-[#CCE1F0] px-4 py-3 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {otLoading ? (
                <tr key="loading">
                  <td colSpan={8} className="px-4 py-10 text-center text-[#1F2A44]/60">
                    Đang tải...
                  </td>
                </tr>
              ) : otRequests.length === 0 ? (
                <tr key="empty">
                  <td colSpan={8} className="px-4 py-10 text-center text-[#1F2A44]/60">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                otRequests.map((request, index, arr) => (
                  <tr key={`${request.id}`} className="bg-white transition-colors hover:bg-[#F4FBFF]">
                    <td className={`px-4 py-3 text-left text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{index + 1}</td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>
                      {new Date(request.otDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>
                      {request.fromTime.substring(11, 16)}
                    </td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>
                      {request.toTime.substring(11, 16)}
                    </td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{request.workedTime}</td>
                    <td className={`px-4 py-3 text-left font-semibold ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'} ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </td>
                    <td className={`px-4 py-3 text-center text-[#1F2A44] max-w-xs overflow-auto ${index < arr.length - 1 ? 'border-b border-r border-[#CCE1F0]' : 'border-r border-[#CCE1F0]'}`}>{request.note || ""}</td>
                    <td className={`px-4 py-3 text-center ${index < arr.length - 1 ? 'border-b border-[#CCE1F0]' : ''}`}>
                      <a className="inline-flex items-center gap-1 text-[#4AB4DE] hover:text-[#3ba1ca] cursor-pointer" href={`/employee/request/ot-detail?id=${request.id}`}>
                        <Info className="h-5 w-5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex items-center justify-end gap-2">
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeOTPageHandler("first")}
            disabled={otIndexPage === 0}
          >
            <ChevronFirst className="h-5 w-5" />
          </button>
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeOTPageHandler("prev")}
            disabled={otIndexPage === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="mx-2 text-sm text-[#1F2A44]">Trang {otIndexPage + 1} trên {otTotalPages}</span>
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeOTPageHandler("next")}
            disabled={otIndexPage >= otTotalPages - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button 
            className="cursor-pointer rounded-lg p-2 text-[#4AB4DE] transition hover:bg-[#F4FBFF] disabled:cursor-not-allowed disabled:opacity-50" 
            onClick={() => changeOTPageHandler("last")}
            disabled={otIndexPage >= otTotalPages - 1}
          >
            <ChevronLast className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}