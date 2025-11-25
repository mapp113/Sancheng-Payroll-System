"use client";

import { ManagerLeavesTable } from "@/app/_components/manager/requests/leaves/table";
import { ManagerLeavesParams, ManagerLeavesResonse } from "@/app/_components/manager/requests/leaves/types";
import { ParamsContext, DataContext } from "@/app/_components/manager/requests/leaves/context";
import { useEffect, useState } from "react";
import { getUserMeta } from "@/app/_components/utils/getUserData";
import LeaveQuotaPopup from "@/app/_components/manager/requests/leaves/leave-quota-popup";

export default function ManagerLeavesPage() {
  const [params, setParams] = useState<ManagerLeavesParams>({
    date: new Date().toISOString().slice(0, 7),
    indexPage: 0,
    maxItems: 20,
  });
  const [leaves, setLeaves] = useState<ManagerLeavesResonse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [showQuotaPopup, setShowQuotaPopup] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setParams((prev) => ({ ...prev, keyword: searchInput, indexPage: 0 }));
    }
  };

  useEffect(() => {
      if (getUserMeta("role") !== "MANAGER" && getUserMeta("role") !== "HR") {
        window.location.href = "/login";
      }
    }, []);

  return (
    <ParamsContext.Provider value={{ params, setParams }}>
      <DataContext.Provider value={{ leaves, setLeaves, loading, setLoading }}>
        <div className="w-full p-4">
          <div className="flex flex-row">
            <input 
              placeholder="Search" 
              className="ml-10 border border-gray-300 rounded px-3 py-1" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button 
              onClick={() => setShowQuotaPopup(true)}
              className="ml-auto mr-5 bg-[#88ccfd] text-blue-900 px-4 py-2 rounded hover:bg-[#4cb4fe] transition-colors cursor-pointer"
            >
              Quản lí số ngày nghỉ phép
            </button>
          </div>

          <hr className="mt-4" />
          <ManagerLeavesTable />
        </div>

        {showQuotaPopup && (
          <LeaveQuotaPopup onClose={() => setShowQuotaPopup(false)} />
        )}
      </DataContext.Provider>
    </ParamsContext.Provider>
  );
}