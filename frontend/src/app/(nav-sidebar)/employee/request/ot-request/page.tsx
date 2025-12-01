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
      const response = await fetch("http://localhost:8080/api/overtime/submit", {
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
      const response = await fetch("http://localhost:8080/api/overtime/submit", {
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
    <div className="flex flex-col items-center justify-center h-full p-5">
      <LeavesToolBar />
      <div className="w-3xl px-5 pt-2 pb-5 mt-10 bg-[#d5f1f5] rounded-2xl">
        <h1 className="text-lg text-center">Yêu cầu xin OT</h1>
        <div className="my-2 grid grid-cols-[150px_1fr] items-center">
          <label htmlFor="ot-date">Ngày làm thêm:</label>
          <div className="flex items-center gap-4">
            <input
              id="ot-date"
              className="border border-black rounded px-2 py-1 w-fit"
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

            <div className="px-2 py-1 rounded border bg-white text-sm text-gray-700">
              {formData.otType || "-"}
            </div>
          </div>
        </div>
        <div className="my-2 grid grid-cols-[150px_1fr] items-center">
          <label htmlFor="fromTime">Từ:</label>
          <div className="flex items-center gap-2">
            <input
              id="fromTime"
              className="border border-black rounded px-2 py-1 w-fit"
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
            <span>giờ</span>
          </div>
        </div>
        <div className="my-2 grid grid-cols-[150px_1fr] items-center">
          <label htmlFor="toTime">Đến:</label>
          <div className="flex items-center gap-2">
            <input
              id="toTime"
              className="border border-black rounded px-2 py-1 w-fit"
              type="number"
              min="0"
              max="23"
              required
              value={formData.toTime}
              onChange={(e) => handleInputChange("toTime", parseInt(e.target.value) || 0)}
            />
            <span>giờ</span>
          </div>
        </div>
        <div className="font-semibold my-2 grid grid-cols-[150px_1fr] items-center">Tổng số giờ OT:
            <span className="text-lg">
            {formData.fromTime !== undefined && formData.toTime !== undefined && formData.toTime > formData.fromTime
              ? `${formData.toTime - formData.fromTime} giờ`
              : '0 giờ'}
            </span>
        </div>
        
        <div className="my-2 grid grid-cols-[150px_1fr] items-start">
          <span className="pt-1">Lý do:</span>
          <textarea
            className="border border-black rounded px-2 py-1 max-h-md w-96 resize-y"
            rows={3}
            value={formData.reason}
            onChange={(e) => handleInputChange("reason", e.target.value)}
          />
        </div>
        <div className="flex">
          <button
            className="ml-2 border border-black rounded px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
            onClick={handleReset}
          >
            Reset / Clear
          </button>
          <div className="ml-auto">
            <button
              className="border border-black rounded px-4 py-2 bg-green-500 text-white hover:bg-green-600 cursor-pointer"
              onClick={handleSubmitClick}
            >
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
      
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