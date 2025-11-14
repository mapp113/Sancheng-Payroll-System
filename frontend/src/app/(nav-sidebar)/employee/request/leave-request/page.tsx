"use client";

import { useState, useEffect } from "react";
import { RequestLeaveData } from "@/app/_components/employee/request/leave/types";
import LeavesToolBar from "@/app/_components/leaves/tool-bar";
import { dateSlashToHyphen } from "@/app/_components/utils/dateSlashToHyphen";

interface LeaveTypeOption {
  code: string;
  name: string;
}

export default function LeavesPage() {
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

  useEffect(() => {
    async function fetchLeaveTypeOptions() {
      try {
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch("http://localhost:8080/api/leave/options", {
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
      const response = await fetch("http://localhost:8080/api/leave/submit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
        // Không cần set Content-Type header, browser sẽ tự động set cho multipart/form-data
      });

      if (response.ok) {
        //console.log("Gửi yêu cầu thành công");
        alert("Gửi yêu cầu thành công");
        handleReset();
      } else {
        throw new Error(response.statusText);
      }

    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      alert("Gửi yêu cầu thất bại");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-5">
      <LeavesToolBar />
      <div className="w-3xl px-5 pt-2 pb-5 mt-10 bg-[#d5f1f5] rounded-2xl">
        <h1 className="text-lg text-center">Yêu cầu xin nghỉ</h1>
        <div className="my-2">
          <label htmlFor="leave-type">Loại nghỉ:</label>
          <select
            id="leave-type"
            className="ml-5 border border-black rounded px-2 py-1"
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
        <div className="my-2">
          Ngày bắt đầu:
          <input
            id="leave-request-start-date"
            type="date"
            className="ml-5 border border-black rounded px-2 py-1"
            value={formData.fromDate}
            onChange={(e) => handleSelectChange("fromDate", e.target.value)}
          />
        </div>
        <div className="my-2 flex flex-row">
          <div>
            <div>Ngày kết thúc:</div>
            <div>(Nếu chọn nhiều)</div>
          </div>
          <input
            id="leave-request-end-date"
            type="date"
            className="ml-5 border border-black rounded px-2 py-1"
            value={formData.toDate}
            onChange={(e) => handleSelectChange("toDate", e.target.value)}
          />
        </div>
        <div className="my-2 flex">
          <span className="">Thời gian nghỉ: </span>
          <span className="ml-2 font-semibold">
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
        <div className="my-2 flex">
          <span className="pt-1">Lý do:</span>
          <textarea
            className="ml-5 border border-black rounded px-2 py-1 max-h-md w-md resize-y"
            rows={3}
            value={formData.reason}
            onChange={(e) => handleSelectChange("reason", e.target.value)}
          />
        </div>
        <div className="h-fit my-2 items-center">
          <input
            type="file"
            className="ml-2 file:mr-4 file:py-2 file:px-4 file:rounded-full 
             file:border-0 file:text-sm file:font-semibold
             file:bg-blue-50 file:text-blue-700 
             file:hover:bg-blue-100"
            onChange={handleFileChange}
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