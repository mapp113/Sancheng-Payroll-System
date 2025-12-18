"use client";

import LeavesToolBar from "@/app/_components/leaves/tool-bar";
import { dateSlashToHyphen } from "@/app/_components/utils/dateSlashToHyphen";
import { useState } from "react";
import { NotificationProvider, useNotification } from "@/app/_components/common/pop-box/notification/notification-context";
import BottomRightNotification from "@/app/_components/common/pop-box/notification/bottom-right";
import ConfirmPopBox from "@/app/_components/common/pop-box/confirm";
import SubmitConfirmation from "@/app/_components/common/pop-box/submit-confirmation";

interface OTRequestData {
  otDate: string;
  fromTime: number;
  toTime: number;
  otType: string;
  reason: string;
  confirmOverLimit?: boolean;
}

function OTRequestsPageContent() {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState<OTRequestData>({
    otDate: "",
    fromTime: 0,
    toTime: 0,
    otType: "",
    reason: "",
  });
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Tự động xác định loại OT dựa trên ngày được chọn
  const getOTTypeFromDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Kiểm tra nếu là thứ 7 hoặc chủ nhật
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "Thứ 7/Chủ nhật";
    }

    // Mặc định là ngày thường
    return "Ngày thường";
  };

  const handleInputChange = (field: keyof OTRequestData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      otDate: "",
      fromTime: 0,
      toTime: 0,
      otType: "",
      reason: "",
    });
  };

  const handleConfirmOverLimit = async () => {
    // Gọi lại API với confirmOverLimit = true
    setShowConfirmPopup(false);
    setShowSubmitConfirm(false);
    
    const formDataToSend = new FormData();
    formDataToSend.append("otDate", dateSlashToHyphen(formData.otDate));
    const fromDateTime = `${dateSlashToHyphen(formData.otDate)}T${String(formData.fromTime).padStart(2, '0')}:00:00`;
    formDataToSend.append("fromTime", fromDateTime);
    const toDateTime = `${dateSlashToHyphen(formData.otDate)}T${String(formData.toTime).padStart(2, '0')}:00:00`;
    formDataToSend.append("toTime", toDateTime);
    formDataToSend.append("reason", formData.reason);
    formDataToSend.append("confirmOverLimit", "true");

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/submit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        addNotification("ok", "Thành công", "Gửi yêu cầu OT thành công", 3000);
        handleReset();
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu OT:", error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      addNotification("error", "Lỗi", `Gửi yêu cầu OT thất bại: ${errorMessage}`, 5000);
    }
  };

  const handleCancelOverLimit = () => {
    setShowConfirmPopup(false);
  };

  const handleSubmitClick = () => {
    // Validate required fields
    if (!formData.otDate || formData.fromTime === undefined || formData.toTime === undefined) {
      addNotification("error", "Lỗi", "Vui lòng điền đầy đủ thông tin ngày làm thêm và thời gian", 4000);
      return;
    }

    // Validate fromTime < toTime
    if (formData.fromTime >= formData.toTime) {
      addNotification("error", "Lỗi", "Giờ bắt đầu phải nhỏ hơn giờ kết thúc", 4000);
      return;
    }

    // Validate: Ngày thường phải bắt đầu từ 17 giờ trở lên
    if (formData.otType === "Ngày thường" && formData.fromTime < 17) {
      addNotification("error", "Lỗi", "OT ngày thường phải bắt đầu từ 17 giờ trở đi", 4000);
      return;
    }

    // Hiện confirmation dialog
    setShowSubmitConfirm(true);
  };

  const handleSubmit = async () => {
    setShowSubmitConfirm(false);

    // Tạo FormData cho multipart/form-data
    const formDataToSend = new FormData();

    // otDate: LocalDate (YYYY-MM-DD)
    formDataToSend.append("otDate", dateSlashToHyphen(formData.otDate));

    // fromTime: LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    const fromDateTime = `${dateSlashToHyphen(formData.otDate)}T${String(formData.fromTime).padStart(2, '0')}:00:00`;
    formDataToSend.append("fromTime", fromDateTime);

    // toTime: LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    const toDateTime = `${dateSlashToHyphen(formData.otDate)}T${String(formData.toTime).padStart(2, '0')}:00:00`;
    formDataToSend.append("toTime", toDateTime);

    // reason: String
    formDataToSend.append("reason", formData.reason);

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/submit`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const responseText = await response.text();
        
        // Kiểm tra nếu response chứa "OT_OVER_LIMIT" và "CONFIRM"
        if (responseText.includes("OT_OVER_LIMIT") && responseText.includes("CONFIRM")) {
          // Trích xuất message từ response text
          const messageMatch = responseText.match(/message=([^}]+)/);
          const message = messageMatch 
            ? messageMatch[1].trim() 
            : "Vượt quá giới hạn OT. Bạn có chắc chắn muốn tiếp tục gửi đơn OT này không?";
          
          setConfirmMessage(message);
          setShowSubmitConfirm(false);
          setShowConfirmPopup(true);
          return;
        }
        
        addNotification("ok", "Thành công", "Gửi yêu cầu OT thành công", 3000);
        handleReset();
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu OT:", error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      addNotification("error", "Lỗi", `Gửi yêu cầu OT thất bại: ${errorMessage}`, 5000);
    }
  };

  return (
    <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
      <LeavesToolBar />
      <section className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-[#1F2A44]">Yêu cầu xin OT</h1>
        
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="ot-date" className="min-w-[140px] text-sm font-medium text-[#1F2A44]">Ngày làm thêm:</label>
          <div className="flex flex-1 items-center gap-3">
            <input
              id="ot-date"
              className="flex-1 rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
              type="date"
              value={formData.otDate}
              onChange={(e) => {
                const selectedDate = e.target.value;
                handleInputChange("otDate", selectedDate);
                // Tự động set loại OT dựa trên ngày được chọn
                const autoOTType = getOTTypeFromDate(selectedDate);
                handleInputChange("otType", autoOTType);
              }}
            />
            <div className="rounded-full border border-[#4AB4DE] bg-[#F4FBFF] px-4 py-2 text-sm font-semibold text-[#4AB4DE]">
              {formData.otType || "-"}
            </div>
          </div>
        </div>
        
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="fromTime" className="min-w-[140px] text-sm font-medium text-[#1F2A44]">Từ:</label>
          <div className="flex items-center gap-2">
            <input
              id="fromTime"
              className="w-20 rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
              type="number"
              min="0"
              max="23"
              required
              value={formData.fromTime}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                handleInputChange("fromTime", value);
                
                // Kiểm tra ngay khi người dùng nhập
                if (formData.otType === "Ngày thường" && value < 17 && value > 0) {
                  addNotification("error", "Lỗi", "OT ngày thường phải bắt đầu từ 17 giờ trở đi", 3000);
                }
              }}
            />
            <span className="text-sm text-[#1F2A44]">giờ</span>
          </div>
        </div>
        
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="toTime" className="min-w-[140px] text-sm font-medium text-[#1F2A44]">Đến:</label>
          <div className="flex items-center gap-2">
            <input
              id="toTime"
              className="w-20 rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40"
              type="number"
              min="0"
              max="23"
              required
              value={formData.toTime}
              onChange={(e) => handleInputChange("toTime", parseInt(e.target.value) || 0)}
            />
            <span className="text-sm text-[#1F2A44]">giờ</span>
          </div>
        </div>
        
        <div className="mb-4 rounded-xl border border-dashed border-[#CCE1F0] bg-[#F4FBFF] p-4">
          <span className="text-sm text-[#1F2A44]/80">Tổng số giờ OT: </span>
          <span className="text-lg font-semibold text-[#4AB4DE]">
            {formData.fromTime !== undefined && formData.toTime !== undefined && formData.toTime > formData.fromTime
              ? `${formData.toTime - formData.fromTime} giờ`
              : '0 giờ'}
          </span>
        </div>
        
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#1F2A44]">Lý do:</label>
          <textarea
            className="w-full rounded-xl border border-[#CCE1F0] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#4AB4DE] focus:ring-2 focus:ring-[#4AB4DE]/40 resize-y"
            rows={4}
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
            placeholder="Nhập lý do làm thêm giờ..."
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
        message="Bạn có chắc chắn muốn gửi yêu cầu OT này không?"
        details={`Ngày: ${formData.otDate ? new Date(formData.otDate).toLocaleDateString('vi-VN') : ''} | Thời gian: ${formData.fromTime}:00 - ${formData.toTime}:00 (${formData.toTime - formData.fromTime} giờ)`}
      />

      {showConfirmPopup && (
        <ConfirmPopBox
          title="Xác nhận vượt giới hạn OT"
          message={confirmMessage}
          onConfirm={handleConfirmOverLimit}
          onCancel={handleCancelOverLimit}
          confirmText="Đồng ý"
          cancelText="Từ chối"
        />
      )}
    </div>
  );
}

export default function OTRequestsPage() {
  return (
    <NotificationProvider>
      <OTRequestsPageContent />
      <BottomRightNotification />
    </NotificationProvider>
  );
}