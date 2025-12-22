"use client";

import { useState, useEffect } from "react";
import { RequestLeaveData } from "@/app/_components/employee/request/leave/types";
import LeavesToolBar from "@/app/_components/leaves/tool-bar";
import { dateSlashToHyphen } from "@/app/_components/utils/dateSlashToHyphen";
import { NotificationProvider, useNotification } from "@/app/_components/common/pop-box/notification/notification-context";
import BottomRightNotification from "@/app/_components/common/pop-box/notification/bottom-right";
import SubmitConfirmation from "@/app/_components/common/pop-box/submit-confirmation";

interface LeaveTypeOption {
  code: string;
  name: string;
}

interface LeaveBalanceResponse {
  remainingDays: number;
  usedDays: number;
  totalDays: number;
}

function LeavesPageContent() {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState<RequestLeaveData>({
    employeeCode: "EMP001",
    leaveType: "annual",
    isPaidLeave: true,
    fromDate: "",
    toDate: "",
    duration: "FULL_DAY",
    reason: "",
    attachment: null,
  });
  const [leaveTypeOptions, setLeaveTypeOptions] = useState<LeaveTypeOption[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalanceResponse | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    async function fetchLeaveTypeOptions() {
      try {
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/options`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLeaveTypeOptions(data);
        }
      } catch (error) {
        console.error("Error fetching leave type options:", error);
      }
    }

    fetchLeaveTypeOptions();
  }, []);

  // Fetch leave balance when component mounts or leave type changes
  useEffect(() => {
    async function fetchLeaveBalance() {
      if (!formData.leaveType) return;
      
      setLoadingBalance(true);
      try {
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/remaining-by-type?leaveTypeCode=${formData.leaveType}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const remainingDays = await response.json();
          setLeaveBalance({
            remainingDays: remainingDays,
            usedDays: 0,
            totalDays: 0,
          });
        } else {
          setLeaveBalance(null);
        }
      } catch (error) {
        console.error("Error fetching leave balance:", error);
        setLeaveBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    }

    fetchLeaveBalance();
  }, [formData.leaveType]);

  const handleSelectChange = (id: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      attachment: file,
    }));
  };

  const handleReset = () => {
    setFormData((prev) => ({
      ...prev,
      fromDate: "",
      toDate: "",
      reason: "",
      attachment: null,
    }));
  };

  const handleSubmitClick = () => {
    // Validate required fields
    if (!formData.fromDate) {
      addNotification("error", "Lỗi", "Vui lòng chọn ngày bắt đầu", 4000);
      return;
    }

    if (!formData.reason.trim()) {
      addNotification("error", "Lỗi", "Vui lòng nhập lý do nghỉ phép", 4000);
      return;
    }

    // Hiện confirmation dialog
    setShowSubmitConfirm(true);
  };

  const handleSubmit = async () => {
    //console.log("Form Data:", formData);

    // Tạo FormData cho multipart/form-data
    const formDataToSend = new FormData();
    formDataToSend.append("employeeCode", formData.employeeCode);
    formDataToSend.append("leaveType", formData.leaveType);
    formDataToSend.append("isPaidLeave", formData.isPaidLeave.toString());
    formDataToSend.append("fromDate", dateSlashToHyphen(formData.fromDate));
    formDataToSend.append("toDate", dateSlashToHyphen(formData.toDate));
    formDataToSend.append("duration", formData.duration);
    formDataToSend.append("reason", formData.reason);

    if (formData.attachment) {
      formDataToSend.append("attachment", formData.attachment);
    }

    // Gửi request
    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leave/submit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
        // Không cần set Content-Type header, browser sẽ tự động set cho multipart/form-data
      });

      if (response.ok) {
        addNotification("ok", "Thành công", "Gửi yêu cầu nghỉ phép thành công", 3000);
        handleReset();
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }

    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      addNotification("error", "Lỗi", `Gửi yêu cầu thất bại: ${errorMessage}`, 5000);
    }
  };

  return (
    <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
      <LeavesToolBar />
      <section className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-[#1F2A44]">Yêu cầu xin nghỉ</h1>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <label htmlFor="leave-type" className="text-sm font-medium text-[#1F2A44]">Loại nghỉ:</label>
            <select
              id="leave-type"
              className="rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
              value={formData.leaveType}
              onChange={(e) => handleSelectChange("leaveType", e.target.value)}
            >
              {leaveTypeOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          {(() => {
            const leaveTypeName = leaveTypeOptions.find(opt => opt.code === formData.leaveType)?.name;
            return leaveTypeName !== "Nghỉ ốm" && leaveTypeName !== "Thai sản" && leaveTypeName !== "Nghỉ không lương" && (

              <div className="rounded-full border border-[#4AB4DE] bg-[#F4FBFF] px-4 py-2">
                <span className="text-sm font-semibold text-[#4AB4DE]">
                  {(loadingBalance) ? (
                    "Đang tải..."
                  ) : leaveBalance ? (
                    `Còn lại: ${leaveBalance.remainingDays} ngày`
                  ) : (
                    "Còn lại: -- ngày"
                  )}
                </span>
              </div>
            );
          })()}
        </div>
        <div className="mb-4 flex items-center gap-3">
          <label className="min-w-[120px] text-sm font-medium text-[#1F2A44]">Ngày bắt đầu:</label>
          <input
            id="leave-request-start-date"
            type="date"
            className="flex-1 rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
            value={formData.fromDate}
            onChange={(e) => handleSelectChange("fromDate", e.target.value)}
          />
        </div>
        <div className="mb-4 flex items-center gap-3">
          <div className="min-w-[120px]">
            <div className="text-sm font-medium text-[#1F2A44]">Ngày kết thúc:</div>
            <div className="text-xs text-[#1F2A44]/60">(Nếu chọn nhiều)</div>
          </div>
          <input
            id="leave-request-end-date"
            type="date"
            className="flex-1 rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
            value={formData.toDate}
            onChange={(e) => handleSelectChange("toDate", e.target.value)}
          />
        </div>
        <div className="mb-4 rounded-xl border border-dashed border-[#CCE1F0] bg-[#F4FBFF] p-4">
          <span className="text-sm text-[#1F2A44]/80">Thời gian nghỉ: </span>
          <span className="font-semibold text-[#4AB4DE]">
            {formData.fromDate && formData.toDate
              ? (() => {
                const start = new Date(formData.fromDate);
                const end = new Date(formData.toDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return `${diffDays} ngày`;
              })()
              : formData.fromDate
                ? "1 ngày"
                : "Không xác định"}
          </span>
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-[#1F2A44]">Lý do:</label>
          <textarea
            className="w-full rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40 resize-y"
            rows={4}
            value={formData.reason}
            onChange={(e) => handleSelectChange("reason", e.target.value)}
            placeholder="Nhập lý do nghỉ phép..."
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#1F2A44]">File đính kèm (nếu có):</label>
          <input
            type="file"
            className="w-full text-sm text-[#1F2A44]
             file:mr-4 file:rounded-full file:border-0
             file:bg-[#4AB4DE] file:px-4 file:py-2
             file:text-sm file:font-semibold file:text-white
             file:transition file:hover:bg-[#3ba1ca]
             file:cursor-pointer"
            onChange={handleFileChange}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            className="cursor-pointer rounded-full border border-[#CCE1F0] bg-white px-6 py-2 text-sm font-semibold text-[#1F2A44] transition hover:bg-[#F4FBFF]"
            onClick={handleReset}
          >
            Đặt lại
          </button>
          <button
            className="cursor-pointer rounded-full border border-[#4AB4DE] bg-[#4AB4DE] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#3ba1ca]"
            onClick={handleSubmitClick}
          >
            Gửi yêu cầu
          </button>
        </div>
      </section>

      <SubmitConfirmation
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        onConfirm={handleSubmit}
        message="Bạn có chắc chắn muốn gửi yêu cầu nghỉ phép này không?"
        details={`Loại: ${leaveTypeOptions.find(opt => opt.code === formData.leaveType)?.name || formData.leaveType} | Từ: ${formData.fromDate ? new Date(formData.fromDate).toLocaleDateString('vi-VN') : ''} đến: ${formData.toDate ? new Date(formData.toDate).toLocaleDateString('vi-VN') : new Date(formData.fromDate).toLocaleDateString('vi-VN')}`}
      />
    </div>
  );
}

export default function LeavesPage() {
  return (
    <NotificationProvider>
      <LeavesPageContent />
      <BottomRightNotification />
    </NotificationProvider>
  );
}