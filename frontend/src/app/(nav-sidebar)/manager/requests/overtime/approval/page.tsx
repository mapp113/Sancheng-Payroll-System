"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { OTResponseData } from "@/app/_components/employee/request/types";
import RequestConfirmation from "@/app/_components/common/pop-box/request-confirmation";
import SuccessNotification from "@/app/_components/common/pop-box/notification/success";
import ErrorNotification from "@/app/_components/common/pop-box/notification/error";

function OTApprovalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [otData, setOtData] = useState<OTResponseData | null>(null);
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
    
    router.push(`/manager/requests/overtime?${params.toString()}`);
  };

  const handleApprove = async () => {
    if (!id) return;

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/approve/${id}?note=${encodeURIComponent(note)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Đã duyệt yêu cầu làm thêm giờ thành công!");
        setTimeout(() => handleBack(), 2000);
      } else {
        throw new Error("Duyệt yêu cầu OT thất bại!");
      }
    } catch (error) {
      console.error("Error approving OT request:", error);
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra khi duyệt yêu cầu OT!");
    }
  };

  const handleReject = async () => {
    if (!id) return;

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/reject/${id}?note=${encodeURIComponent(note)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Đã từ chối yêu cầu làm thêm giờ!");
        setTimeout(() => handleBack(), 2000);
      } else {
        throw new Error("Từ chối yêu cầu OT thất bại!");
      }
    } catch (error) {
      console.error("Error rejecting OT request:", error);
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra khi từ chối yêu cầu OT!");
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID");
      setLoading(false);
      return;
    }
    if (!id) {
      setError("Không tìm thấy ID");
      setLoading(false);
      return;
    }

    async function fetchOTDetail() {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/detail/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu");
        }

        const data = await response.json();
        setOtData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    }

    fetchOTDetail();
  }, [id]);

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

  if (!otData) {
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
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Yêu Cầu Làm Thêm Giờ</h2>
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 space-y-4">
              {/* Employee Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-500">Mã nhân viên</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">{otData.employeeCode}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-500">Tên nhân viên</div>
                  <div className="mt-1 text-base font-semibold text-gray-900">{otData.fullName}</div>
                </div>
              </div>

              {/* OT Details */}
              <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Thông tin làm thêm giờ</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Ngày làm thêm:</span>
                    <span className="flex-1 text-sm text-gray-900">{otData.otDate}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Thời gian:</span>
                    <span className="flex-1 text-sm text-gray-900">
                      Từ {otData.fromTime.substring(11, 16)} đến {otData.toTime.substring(11, 16)}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Tổng giờ:</span>
                    <span className="flex-1 text-sm font-semibold text-blue-600">{otData.workedTime} giờ</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-32 text-sm font-medium text-gray-600">Loại OT:</span>
                    <span className="flex-1 text-sm text-gray-900">
                      {otData.dayTypeId === 1 && "Ngày Thường"}
                      {otData.dayTypeId === 2 && "Thứ 7/ Chủ Nhật"}
                      {otData.dayTypeId === 3 && "Ngày Lễ"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-2 text-sm font-medium text-gray-700">Lý do làm thêm giờ</div>
                <div className="rounded-md bg-gradient-to-br from-teal-50 to-cyan-100 px-4 py-3 text-sm text-gray-800">
                  {otData.reason}
                </div>
              </div>

              {/* Status */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-500">Trạng thái</div>
                <div className="mt-1">
                  <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                    otData.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    otData.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusText(otData.status)}
                  </span>
                </div>
              </div>

              {/* Note Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ghi chú / Thông báo
                </label>
                <textarea
                  value={otData.note ? otData.note : note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={otData.note ? true : false}
                  className="w-full rounded-lg border border-gray-300 bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                  placeholder="Nhập ghi chú..."
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {otData.status === 'PENDING' && (() => {
              const userStr = sessionStorage.getItem("scpm.auth.user");
              if (!userStr) return null;
              try {
                const user = JSON.parse(userStr);
                if (user.role !== 'MANAGER') return null;
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
        requestType="overtime"
      />
      <RequestConfirmation
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        type="reject"
        requestType="overtime"
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

export default function OTApprovalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTApprovalContent />
    </Suspense>
  );
}