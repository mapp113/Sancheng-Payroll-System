"use client";

import LeavesToolBar from "@/app/_components/leaves/tool-bar";
import { dateSlashToHyphen } from "@/app/_components/utils/dateSlashToHyphen";
import { useState } from "react";

interface OTRequestData {
  otDate: string;
  fromTime: string;
  toTime: string;
  otType: string;
  reason: string;
}

const leaveTypes = ["Ngày thường", "Thứ 7/Chủ nhật", "Ngày lễ"];

export default function OTRequestsPage() {
  const [minToTimeBound, setMinToTimeBound] = useState("00:00");
  const [formData, setFormData] = useState<OTRequestData>({
    otDate: "",
    fromTime: "",
    toTime: "",
    otType: "",
    reason: "",
  });

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

  const handleInputChange = (field: keyof OTRequestData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      otDate: "",
      fromTime: "",
      toTime: "",
      otType: "",
      reason: "",
    });
    setMinToTimeBound("00:00");
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.otDate || !formData.fromTime || !formData.toTime) {
      alert("Vui lòng điền đầy đủ thông tin ngày làm thêm và thời gian");
      return;
    }

    // Tạo FormData cho multipart/form-data
    const formDataToSend = new FormData();

    // otDate: LocalDate (YYYY-MM-DD)
    formDataToSend.append("otDate", dateSlashToHyphen(formData.otDate));

    // fromTime: LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    const fromDateTime = `${dateSlashToHyphen(formData.otDate)}T${formData.fromTime}:00`;
    formDataToSend.append("fromTime", fromDateTime);

    // toTime: LocalDateTime (YYYY-MM-DDTHH:mm:ss)
    const toDateTime = `${dateSlashToHyphen(formData.otDate)}T${formData.toTime}:00`;
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
        alert("Gửi yêu cầu OT thành công");
        handleReset();
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu OT:", error);
      alert("Gửi yêu cầu OT thất bại");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-5">
      <LeavesToolBar />
      <div className="w-3xl px-5 pt-2 pb-5 mt-10 bg-[#d5f1f5] rounded-2xl">
        <h1 className="text-lg text-center">Yêu cầu xin OT</h1>
        <div className="my-2 grid grid-cols-[150px_1fr] items-center">
          <label htmlFor="ot-date">Ngày làm thêm:</label>
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
        </div>
        <div className="my-2 grid grid-cols-[150px_1fr] items-center">
          <label htmlFor="fromTime">Từ:</label>
          <input
            id="fromTime"
            className="border border-black rounded px-2 py-1 w-fit"
            type="time"
            min="00:00"
            max="23:59"
            required
            value={formData.fromTime}
            onChange={(e) => {
              setMinToTimeBound(e.target.value);
              handleInputChange("fromTime", e.target.value);
            }}
          />
        </div>
        <div className="my-2 grid grid-cols-[150px_1fr] items-center">
          <label htmlFor="toTime">Đến:</label>
          <input
            id="toTime"
            className="border border-black rounded px-2 py-1 w-fit"
            type="time"
            min={minToTimeBound}
            max="23:59"
            required
            value={formData.toTime}
            onChange={(e) => handleInputChange("toTime", e.target.value)}
          />
        </div>
        <div className="font-semibold my-2 grid grid-cols-[150px_1fr] items-center">Tổng số giờ OT:
            <span className="text-lg">
            {formData.fromTime && formData.toTime
              ? (() => {
                const [fromHour, fromMinute] = formData.fromTime.split(':').map(Number);
                const [toHour, toMinute] = formData.toTime.split(':').map(Number);
                const fromTotalMinutes = fromHour * 60 + fromMinute;
                const toTotalMinutes = toHour * 60 + toMinute;
                const diffMinutes = toTotalMinutes - fromTotalMinutes;
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return `${hours} giờ ${minutes} phút`;
              })()
              : '0 giờ 0 phút'}
            </span>
        </div>
        <div className="my-2 grid grid-cols-[150px_1fr] items-center">
          <label htmlFor="ot-type">Loại OT:</label>
          <select
            id="ot-type"
            className="border border-black rounded px-2 py-1 w-fit"
            value={formData.otType}
            onChange={(e) => handleInputChange("otType", e.target.value)}
          >
            <option value="">Chọn loại OT</option>
            {leaveTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
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
              onClick={handleSubmit}
            >
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}