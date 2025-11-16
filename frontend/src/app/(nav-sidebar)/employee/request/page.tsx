"use client";

import LeavesToolBar from "@/app/_components/employee/request/tool-bar";
import { useEffect, useState } from "react";
import { LeaveResponseData, OTResponseData } from "@/app/_components/employee/request/types";
import { Info } from "lucide-react";

export default function LeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveResponseData[]>([]);
  const [otRequests, setOtRequests] = useState<OTResponseData[]>([]);
  const [leaveLoading, setLeaveLoading] = useState(true);
  const [otLoading, setOtLoading] = useState(true);
  const [remainingLeave, setRemainingLeave] = useState<number | null>(null);
  const [remainingOT, setRemainingOT] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = sessionStorage.getItem("scpm.auth.token");

        // Fetch leave requests
        const requestsResponse = await fetch("http://localhost:8080/api/leave/myrequest", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setLeaveRequests(requestsData.content);
        }

        // Fetch remaining leave
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

        // Fetch remaining OT
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

        // Fetch OT requests
        const otRequestsResponse = await fetch("http://localhost:8080/api/overtime/myrequest", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (otRequestsResponse.ok) {
          const otRequestsData = await otRequestsResponse.json();
          setOtRequests(otRequestsData.content);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLeaveLoading(false);
        setOtLoading(false);
      }
    }

    fetchData();
  }, []);

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
                    {request.fromTime.substring(12, 16)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {request.toTime.substring(12, 16)}
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
      </div>
    </div>
  );
}