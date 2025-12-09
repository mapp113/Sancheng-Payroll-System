"use client";

import { ManagerLeavesTable } from "@/app/_components/manager/requests/leaves/table";
import { ManagerLeavesParams, ManagerLeavesResonse } from "@/app/_components/manager/requests/leaves/types";
import { ParamsContext, DataContext } from "@/app/_components/manager/requests/leaves/context";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserMeta } from "@/app/_components/utils/getUserData";
import LeaveQuotaPopup from "@/app/_components/manager/requests/leaves/leave-quota-popup";

export default function ManagerLeavesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Khôi phục state từ URL params
  const [params, setParams] = useState<ManagerLeavesParams>({
    date: searchParams.get("month") || new Date().toISOString().slice(0, 7),
    indexPage: parseInt(searchParams.get("page") || "0"),
    maxItems: 20,
    keyword: searchParams.get("search") || undefined,
  });
  const [leaves, setLeaves] = useState<ManagerLeavesResonse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
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

  // Cập nhật URL params khi state thay đổi
  useEffect(() => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", params.indexPage.toString());
    urlParams.set("month", params.date);
    if (params.keyword) {
      urlParams.set("search", params.keyword);
    }
    router.replace(`?${urlParams.toString()}`, { scroll: false });
  }, [params.indexPage, params.date, params.keyword, router]);

  return (
    <ParamsContext.Provider value={{ params, setParams }}>
      <DataContext.Provider value={{ leaves, setLeaves, loading, setLoading }}>
        <div className="flex h-full flex-col gap-4 bg-[#F8FAFC] p-4 md:p-6">
          <header className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold">Danh Sách Nghỉ Phép</h1>
              <button 
                onClick={() => setShowQuotaPopup(true)}
                className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a9bc5] transition-colors cursor-pointer"
              >
                Quản lí số ngày nghỉ phép
              </button>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
            <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm flex flex-col">
              <div className="flex-1 overflow-hidden">
                <ManagerLeavesTable searchInput={searchInput} setSearchInput={setSearchInput} handleSearchKeyDown={handleSearchKeyDown} />
              </div>
            </section>
          </div>
        </div>

        {showQuotaPopup && (
          <LeaveQuotaPopup onClose={() => setShowQuotaPopup(false)} />
        )}
      </DataContext.Provider>
    </ParamsContext.Provider>
  );
}