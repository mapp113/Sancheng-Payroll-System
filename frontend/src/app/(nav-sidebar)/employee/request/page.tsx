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
  const leaveMaxItems = 10;

  // Pagination states for OT
  const [otIndexPage, setOtIndexPage] = useState(0);
  const [otTotalPages, setOtTotalPages] = useState(1);
  const otMaxItems = 10;

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

        const requestsResponse = await fetch(`http://localhost:8080/api/leave/myrequest?${queryParams}`, {
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
          const remainingResponse = await fetch("http://localhost:8080/api/leave/remainingLeave", {
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

        const otRequestsResponse = await fetch(`http://localhost:8080/api/overtime/myrequest?${queryParams}`, {
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
          const remainingOTResponse = await fetch("http://localhost:8080/api/overtime/remaining-week", {
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
    <div className="py-2 px-10">
      <LeavesToolBar />
      <div className="flex flex-row w-full my-2">
        <h2 className="font-bold">Yêu cầu xin nghỉ</h2>
        <span className="flex-1 text-center">
          Số ngày nghỉ còn lại: <span className="font-bold">{remainingLeave !== null ? remainingLeave : "..."}</span>
        </span>
      </div>
      <div className="w-full h-fit my-5 bg-[#d5f1f5] border rounded-lg shadow-md p-2">
        <table className="w-full table-auto border-0">
          <thead className="sticky top-0 rounded-lg">
            <tr>
              <th className="px-4 py-2 text-left">STT</th>
              <th className="px-4 py-2 text-center">Ngày bắt đầu</th>
              <th className="px-4 py-2 text-center">Ngày kết thúc</th>
              <th className="px-4 py-2 text-center">Loại nghỉ</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-center">Thông báo</th>
              <th className="px-4 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {leaveLoading ? (
              <tr key="loading">
                <td colSpan={7} className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : leaveRequests.length === 0 ? (
              <tr key="empty">
                <td colSpan={7} className="text-center py-4">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              leaveRequests.map((request, index) => (
                <tr key={`${request.id}`} className="border-b hover:bg-white/50">
                  <td className="px-4 py-2 text-left">{index + 1}</td>
                  <td className="px-4 py-2 text-center">
                    {new Date(request.fromDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {new Date(request.toDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-2 text-center">{request.leaveTypeCode}</td>
                  <td className={`px-4 py-2 text-left font-semibold ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </td>
                  <td className="px-4 py-2 text-center max-w-full overflow-auto">{request.note || ""}</td>
                  <td className="px-4 py-2 text-center">
                    <a className="hover:underline cursor-pointer" href={`/employee/request/leave-detail?id=${request.id}`}><Info /></a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end align-middle my-3 mr-2">
          <button className="cursor-pointer" onClick={() => changeLeavePageHandler("first")}><ChevronFirst /></button>
          <button className="cursor-pointer" onClick={() => changeLeavePageHandler("prev")}><ChevronLeft /></button>
          <span className="mx-2">Page {leaveIndexPage + 1} of {leaveTotalPages}</span>
          <button className="cursor-pointer" onClick={() => changeLeavePageHandler("next")}><ChevronRight /></button>
          <button className="cursor-pointer" onClick={() => changeLeavePageHandler("last")}><ChevronLast /></button>
        </div>
      </div>
      <div className="flex flex-row w-full my-2">
        <h2 className="font-bold">Yêu cầu Overtime</h2>
        <span className="flex-1 text-center">Số giờ OT còn lại trong tuần:<span className="font-bold">{remainingOT !== null ? remainingOT : "..."}</span></span>
      </div>
      <div className="w-full h-fit my-5 bg-[#d5f1f5] border rounded-lg shadow-md p-2">
        <table className="w-full table-auto border-0">
          <thead className="sticky top-0 rounded-lg">
            <tr>
              <th className="px-4 py-2 text-left">STT</th>
              <th className="px-4 py-2 text-center">Ngày OT</th>
              <th className="px-4 py-2 text-center">Giờ bắt đầu</th>
              <th className="px-4 py-2 text-center">Giờ kết thúc</th>
              <th className="px-4 py-2 text-center">Số giờ OT</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-center">Thông báo</th>
              <th className="px-4 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {otLoading ? (
              <tr key="loading">
                <td colSpan={7} className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : otRequests.length === 0 ? (
              <tr key="empty">
                <td colSpan={7} className="text-center py-4">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              otRequests.map((request, index) => (
                <tr key={`${request.id}`} className="border-b hover:bg-white/50">
                  <td className="px-4 py-2 text-left">{index + 1}</td>
                  <td className="px-4 py-2 text-center">
                    {new Date(request.otDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {request.fromTime.substring(11, 16)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {request.toTime.substring(11, 16)}
                  </td>
                  <td className="px-4 py-2 text-center">{request.workedTime}</td>
                  <td className={`px-4 py-2 text-left font-semibold ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </td>
                  <td className="px-4 py-2 text-center max-w-full overflow-auto">{request.note || ""}</td>
                  <td className="px-4 py-2 text-center">
                    <a className="hover:underline cursor-pointer" href={`/employee/request/ot-detail?id=${request.id}`}><Info /></a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end align-middle my-3 mr-2">
          <button className="cursor-pointer" onClick={() => changeOTPageHandler("first")}><ChevronFirst /></button>
          <button className="cursor-pointer" onClick={() => changeOTPageHandler("prev")}><ChevronLeft /></button>
          <span className="mx-2">Page {otIndexPage + 1} of {otTotalPages}</span>
          <button className="cursor-pointer" onClick={() => changeOTPageHandler("next")}><ChevronRight /></button>
          <button className="cursor-pointer" onClick={() => changeOTPageHandler("last")}><ChevronLast /></button>
        </div>
      </div>
    </div>
  );
}