"use client";

import { useEffect, useState } from "react";
import { getUserData } from "../utils/getUserData";

export default function LeavesToolBar() {
  const [userName, setUserName] = useState<string>("");
  const [userCode, setUserCode] = useState<string>("");
  
  useEffect(() => {
    setUserName(getUserData("full_name") || "");
    setUserCode(getUserData("employee_code") || "");
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <a href="./" className="rounded-full border border-[#4AB4DE] bg-white px-4 py-2 text-sm font-semibold text-[#4AB4DE] transition hover:bg-[#F4FBFF]">
        Quay lại
      </a>
      <div className="flex-1 rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-[#1F2A44]/60">Nhân viên:</span>
            <span className="text-lg font-semibold text-[#4AB4DE]">{userName}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-[#1F2A44]/60">Mã nhân viên:</span>
            <span className="text-base text-[#1F2A44]">{userCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}