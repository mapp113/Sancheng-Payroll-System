"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { File } from "lucide-react";
import type { LeaveDetailResponse } from "@/app/_components/employee/request/types";
import DeleteConfirmation from "@/app/_components/common/pop-box/delete-confirmation";
import SuccessNotification from "@/app/_components/common/pop-box/notification/success";
import ErrorNotification from "@/app/_components/common/pop-box/notification/error";

export default function LeavesDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [leaveData, setLeaveData] = useState<LeaveDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID");
      setLoading(false);
      return;
    }

    const fetchLeaveDetail = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/detail/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu");
        }

        const data: LeaveDetailResponse = await response.json();
        setLeaveData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetail();
  }, [id]);

  if (loading) {
    return <div className="p-4 text-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!leaveData) {
    return <div className="p-4 text-center">Không tìm thấy dữ liệu</div>;
  }

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

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/myrequest/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Không thể xóa yêu cầu");
      }

      setSuccessMessage("Đã xóa yêu cầu nghỉ phép thành công!");
      setTimeout(() => {
        window.location.href = "../request";
      }, 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <a className="w-fit h-fit border border-black bg-[#8acefd] text-[#4577a0] hover:bg-[#66befc] py-2 px-4 rounded cursor-pointer"
          href="../request">
          Back
        </a>
        {leaveData.status === "PENDING" && (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-fit h-fit border border-black bg-red-500 text-white hover:bg-red-600 py-2 px-4 rounded cursor-pointer"
          >
            Delete
          </button>
        )}
      </div>
      <div className="flex justify-center">
        <div className="w-[60rem] bg-[#d5f1f5] rounded-2xl py-5 px-10">
          <h1 className="text-2xl font-bold text-center mb-6">Chi tiết yêu cầu xin nghỉ</h1>

          <div className="flex flex-col gap-3">
            <div className="flex">
              <div className="w-1/3">
                <strong>Mã nhân viên:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.employeeCode}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Tên nhân viên:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.fullName}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Loại nghỉ:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.leaveTypeCode}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Ngày bắt đầu:</strong>
              </div>
              <div className="w-2/3">
                {new Date(leaveData.fromDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Ngày kết thúc:</strong>
              </div>
              <div className="w-2/3">
                {new Date(leaveData.toDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Thời gian:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.duration}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Nghỉ có lương:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.isPaidLeave ? "Có" : "Không"}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Lí do:</strong>
              </div>
              <div className="w-2/3 bg-[#7aeade] rounded-2xl px-4 py-3 min-h-[100px]">
                {leaveData.reason}
              </div>
            </div>

            {leaveData.file && (
              <div className="flex">
                <div className="w-1/3">
                  <strong>File đính kèm:</strong>
                </div>
                <div className="w-2/3 flex items-center gap-2">
                  <File className="w-5 h-5" />
                  <a href={leaveData.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                    Xem file
                  </a>
                </div>
              </div>
            )}

            <div className="flex">
              <div className="w-1/3">
                <strong>Trạng thái:</strong>
              </div>
              <div className={`w-2/3 font-semibold ${getStatusColor(leaveData.status)}`}>
                {getStatusText(leaveData.status)}
              </div>
            </div>

            {leaveData.approvalDate && (
              <div className="flex">
                <div className="w-1/3">
                  <strong>Ngày phê duyệt:</strong>
                </div>
                <div className="w-2/3">
                  {new Date(leaveData.approvalDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            )}

            {leaveData.note && (
              <div className="flex flex-col">
                <div className="mb-2">
                  <strong>Thông báo từ quản lý:</strong>
                </div>
                <div className="bg-[#7adfeb] rounded-2xl px-4 py-3 min-h-[100px]">
                  {leaveData.note}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        message="Bạn có chắc chắn muốn xóa yêu cầu nghỉ phép này không?"
        itemName={leaveData ? `Nghỉ ${leaveData.leaveTypeCode} từ ${new Date(leaveData.fromDate).toLocaleDateString('vi-VN')}` : ""}
      />

      {/* Notifications */}
      <SuccessNotification
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
      <ErrorNotification
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
    </div>
  );
}