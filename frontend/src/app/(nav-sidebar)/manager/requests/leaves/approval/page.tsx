"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { File } from "lucide-react";
import type { LeaveDetailResponse } from "@/app/_components/employee/request/types";
import RequestConfirmation from "@/app/_components/common/pop-box/request-confirmation";
import SuccessNotification from "@/app/_components/common/pop-box/notification/success";
import ErrorNotification from "@/app/_components/common/pop-box/notification/error";

function ManagerApprovalLeavesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [leaveData, setLeaveData] = useState<LeaveDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleBack = () => {
    const page = searchParams.get("page") || "0";
    const month = searchParams.get("month") || "";
    const search = searchParams.get("search") || "";
    
    const params = new URLSearchParams();
    params.set("page", page);
    if (month) params.set("month", month);
    if (search) params.set("search", search);
    
    router.push(`/manager/requests/leaves?${params.toString()}`);
  };

  const handleViewFile = async () => {
    if (!leaveData?.file) return;
    
    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const fileName = leaveData.file.split('/').pop();
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/attachments/${fileName}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải file");
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    
    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/approve/${id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error("Không thể phê duyệt");
      }

      setSuccessMessage("Đã phê duyệt yêu cầu nghỉ phép thành công!");
      setTimeout(() => handleBack(), 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

  const handleReject = async () => {
    if (!id) return;
    
    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/reject/${id}`, {
        method: 'PUT',
        headers: {
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error("Không thể từ chối");
      }

      setSuccessMessage("Đã từ chối yêu cầu nghỉ phép!");
      setTimeout(() => handleBack(), 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

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
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }); // Thay đổi URL API theo backend của bạn
        
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
    return (
      <div className="flex h-full flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-center p-8 text-center">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-center p-8 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!leaveData) {
    return (
      <div className="flex h-full flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-center p-8 text-center">Không tìm thấy dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm mx-auto w-full max-w-5xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="rounded-full bg-[#4AB4DE] px-6 py-2 text-sm font-medium text-white hover:bg-[#3a9bc5] transition-colors cursor-pointer"
          >
            Quay lại
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 xl:overflow-hidden">
        <section className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm mx-auto w-full max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Yêu Cầu Nghỉ Phép</h2>
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 space-y-4">
              {/* Employee Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-500">Mã nhân viên</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">{leaveData.employeeCode}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-500">Tên nhân viên</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">{leaveData.fullName}</div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Thông tin nghỉ phép</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Loại nghỉ:</span>
                    <span className="flex-1 text-sm text-gray-900">{leaveData.leaveTypeCode}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Ngày bắt đầu:</span>
                    <span className="flex-1 text-sm text-gray-900">{leaveData.fromDate}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Ngày kết thúc:</span>
                    <span className="flex-1 text-sm text-gray-900">{leaveData.toDate}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Thời gian:</span>
                    <span className="flex-1 text-sm font-semibold text-blue-600">{leaveData.duration}</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-2 text-sm font-medium text-gray-700">Lý do nghỉ phép</div>
                <div className="rounded-md bg-gradient-to-br from-teal-50 to-cyan-100 px-4 py-3 text-sm text-gray-800">
                  {leaveData.reason}
                </div>
              </div>

              {/* File Attachment */}
              {leaveData.file && (
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-gray-600" />
                    <button 
                      onClick={handleViewFile}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 underline cursor-pointer"
                    >
                      {leaveData.file.split('/').pop()}
                    </button>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-500">Trạng thái</div>
                <div className="mt-1">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                    leaveData.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    leaveData.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {leaveData.status}
                  </span>
                </div>
              </div>

              {/* Note Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ghi chú / Thông báo
                </label>
                <textarea
                  value={leaveData.note ? leaveData.note : note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={leaveData.note ? true : false}
                  className="w-full rounded-lg border border-gray-300 bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                  placeholder="Nhập ghi chú..."
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {leaveData.status !== 'APPROVED' && leaveData.status !== 'REJECTED' && (() => {
              const userStr = sessionStorage.getItem("scpm.auth.user");
              if (!userStr) return null;
              try {
                const user = JSON.parse(userStr);
                if (user.role !== 'MANAGER') return null;
                if (user.employeeCode === leaveData.employeeCode) return null;
              } catch {
                return null;
              }
              return (
                <div className="mt-6 flex justify-center gap-4">
                  <button 
                    onClick={() => setShowApproveConfirm(true)}
                    className="rounded-lg bg-green-500 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-green-600 hover:shadow-lg cursor-pointer"
                  >
                    ✓ Phê duyệt
                  </button>
                  <button 
                    onClick={() => setShowRejectConfirm(true)}
                    className="rounded-lg bg-red-500 px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-red-600 hover:shadow-lg cursor-pointer"
                  >
                    ✗ Từ chối
                  </button>
                </div>
              );
            })()}
          </div>
        </section>
      </div>

      {/* Confirmation Dialogs */}
      <RequestConfirmation
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        type="approve"
        requestType="leave"
      />
      <RequestConfirmation
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        type="reject"
        requestType="leave"
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

export default function ManagerApprovalLeavesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManagerApprovalLeavesContent />
    </Suspense>
  );
}
