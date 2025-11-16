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
    <div className="flex flex-row w-full items-center">

      <div className="flex flex-row items-center w-full h-fit px-4 py-2 ml-10 bg-[#c0f2fd] rounded-2xl">
        <div>
          <span className="font-bold text-2xl mr-3">Nhân viên:</span>
          <span className="font-bold text-xl text-[#3e699f]">{userName}</span>
          <br />
          <span className="font-bold text-lg mr-2">Mã nhân viên:</span> <span>{userCode}</span>
        </div>
        <div className="ml-auto">
          <a className="border border-black bg-[#79deeb] text-[#4577a0] py-2 px-4 rounded hover:bg-[#49bee1] cursor-pointer"
            href="request/ot-request">Create OT Request</a>
          <a className="mx-5 border border-black bg-[#79deeb] text-[#4577a0] py-2 px-4 rounded hover:bg-[#4bacca] cursor-pointer"
            href="request/leave-request">Create Leave</a>
        </div>
      </div>
    </div>
  );
}