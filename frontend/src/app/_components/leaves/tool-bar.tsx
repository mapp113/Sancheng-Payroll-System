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
    <div className="flex flex-row w-full items-center">
      <a href="./" className="w-fit h-fit border border-black bg-[#8acefd] text-[#4577a0] hover:bg-[#66befc] py-2 px-4 rounded cursor-pointer">Back</a>
      <div className="flex flex-row items-center w-full h-fit px-4 py-2 ml-10 bg-[#c0f2fd] rounded-2xl">
        <div>
          <span className="font-bold text-2xl mr-3">Nhân viên:</span>
          <span className="font-bold text-xl text-[#3e699f]">{userName}</span>
          <br />
          <span className="font-bold text-lg mr-2">Mã nhân viên:</span> <span>{userCode}</span>
        </div>
        <div className="ml-auto">
          <button className="border border-black bg-[#79deeb] text-[#4577a0] py-2 px-4 rounded hover:bg-[#49bee1] cursor-pointer">Create Report</button>
          <button className="mx-5 border border-black bg-[#79deeb] text-[#4577a0] py-2 px-4 rounded hover:bg-[#4bacca] cursor-pointer">Create Leave</button>
        </div>
      </div>
    </div>
  );
}