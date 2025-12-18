"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { File } from "lucide-react";
import type { LeaveDetailResponse } from "@/app/_components/employee/request/types";
import DeleteConfirmation from "@/app/_components/common/pop-box/delete-confirmation";
import SuccessNotification from "@/app/_components/common/pop-box/notification/success";
import ErrorNotification from "@/app/_components/common/pop-box/notification/error";

function LeavesDetailContent() {
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
    <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
      <div className="flex gap-3">
        <a className="cursor-pointer rounded-full border border-[#4AB4DE] bg-white px-4 py-2 text-sm font-semibold text-[#4AB4DE] transition hover:bg-[#F4FBFF]"
          href="../request">
          Quay lại
        </a>
        {leaveData.status === "PENDING" && (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="cursor-pointer rounded-full border border-red-500 bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Xóa yêu cầu
          </button>
        )}
      </div>
      <section className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-[#1F2A44]">Chi tiết yêu cầu xin nghỉ</h1>

          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Mã nhân viên:
              </div>
              <div className="w-2/3 text-[#1F2A44]">
                {leaveData.employeeCode}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Tên nhân viên:
              </div>
              <div className="w-2/3 font-semibold text-[#4AB4DE]">
                {leaveData.fullName}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Loại nghỉ:
              </div>
              <div className="w-2/3 text-[#1F2A44]">
                {leaveData.leaveTypeCode}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Ngày bắt đầu:
              </div>
              <div className="w-2/3 text-[#1F2A44]">
                {new Date(leaveData.fromDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Ngày kết thúc:
              </div>
              <div className="w-2/3 text-[#1F2A44]">
                {new Date(leaveData.toDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Thời gian:
              </div>
              <div className="w-2/3 text-[#1F2A44]">
                {leaveData.duration}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Nghỉ có lương:
              </div>
              <div className="w-2/3 text-[#1F2A44]">
                {leaveData.isPaidLeave ? "Có" : "Không"}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="mb-2 text-sm font-medium text-[#1F2A44]/60">
                Lí do:
              </div>
              <div className="rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-4 py-3 text-[#1F2A44]">
                {leaveData.reason}
              </div>
            </div>

            {leaveData.file && (
              <div className="flex">
                <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                  File đính kèm:
                </div>
                <div className="w-2/3 flex items-center gap-2">
                  <File className="h-5 w-5 text-[#4AB4DE]" />
                  <a href={leaveData.file} target="_blank" rel="noopener noreferrer" className="text-[#4AB4DE] underline transition hover:text-[#3ba1ca]">
                    Xem file
                  </a>
                </div>
              </div>
            )}

            <div className="flex">
              <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                Trạng thái:
              </div>
              <div className={`w-2/3 font-semibold ${getStatusColor(leaveData.status)}`}>
                {getStatusText(leaveData.status)}
              </div>
            </div>

            {leaveData.approvalDate && (
              <div className="flex">
                <div className="w-1/3 text-sm font-medium text-[#1F2A44]/60">
                  Ngày phê duyệt:
                </div>
                <div className="w-2/3 text-[#1F2A44]">
                  {new Date(leaveData.approvalDate).toLocaleDateString('vi-VN')}
                </div>
              </div>
            )}

            {leaveData.note && (
              <div className="flex flex-col">
                <div className="mb-2 text-sm font-medium text-[#1F2A44]/60">
                  Thông báo từ quản lý:
                </div>
                <div className="rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-4 py-3 text-[#1F2A44]">
                  {leaveData.note}
                </div>
              </div>
            )}
          </div>
        </section>

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

export default function LeavesDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeavesDetailContent />
    </Suspense>
  );
}