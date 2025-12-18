"use client";

import { useEffect, useState } from "react";
import { getUserData } from "../../utils/getUserData";

export default function EmployeeToolBar() {
  const [userName, setUserName] = useState<string>("");
  const [userCode, setUserCode] = useState<string>("");

  useEffect(() => {
    setUserName(getUserData("full_name") || "");
    setUserCode(getUserData("employee_code") || "");
  }, []);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-[#1F2A44]/60">Nhân viên:</span>
            <span className="text-xl font-semibold text-[#4AB4DE]">{userName}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-[#1F2A44]/60">Mã nhân viên:</span>
            <span className="text-base text-[#1F2A44]">{userCode}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a 
            className="inline-flex items-center gap-2 rounded-full border border-[#4AB4DE] bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3ba1ca] cursor-pointer"
            href="request/ot-request"
          >
            Tạo yêu cầu OT
          </a>
          <a 
            className="inline-flex items-center gap-2 rounded-full border border-[#4AB4DE] bg-[#4AB4DE] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3ba1ca] cursor-pointer"
            href="request/leave-request"
          >
            Tạo yêu cầu nghỉ phép
          </a>
        </div>
      </div>
    </div>
  );
}