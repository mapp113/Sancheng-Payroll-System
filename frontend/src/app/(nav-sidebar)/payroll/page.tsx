"use client"

import { DataContext, ParamsContext } from "@/app/_components/payroll/payroll-context";
import PayrollTable from "@/app/_components/payroll/table";
import PayrollToolbar from "@/app/_components/payroll/toolbar";
import { PayrollParam, PayrollRecord } from "@/app/_components/payroll/type";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";


function PayrollContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Khôi phục state từ URL params
  const [payrollParams, setPayrollParams] = useState<PayrollParam>({
    keyword: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "",
    date: searchParams.get("month") || (new Date().toISOString().slice(0, 7)),
    page: searchParams.get("page") || "0",
    totalPage: "",
  });
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  
  // Cập nhật URL params khi state thay đổi
  useEffect(() => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", payrollParams.page);
    urlParams.set("month", payrollParams.date);
    if (payrollParams.keyword) {
      urlParams.set("search", payrollParams.keyword);
    }
    if (payrollParams.sortBy) {
      urlParams.set("sortBy", payrollParams.sortBy);
    }
    router.replace(`?${urlParams.toString()}`, { scroll: false });
  }, [payrollParams.page, payrollParams.date, payrollParams.keyword, payrollParams.sortBy, router]);
  
  return (
    <ParamsContext.Provider value={{ payrollParams, setPayrollParams }}>
      <DataContext.Provider value={{ payrollData, setPayrollData }}>
        <div className="flex h-full flex-col gap-4 p-4 md:p-6">
          <header className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold">Bảng Lương Nhân Viên</h1>
              <PayrollToolbar />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
            <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm flex flex-col">
              <div className="flex-1 overflow-hidden">
                <PayrollTable />
              </div>
            </section>
          </div>
        </div>
      </DataContext.Provider>
    </ParamsContext.Provider>
  );
}

export default function PayrollPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayrollContent />
    </Suspense>
  );
}
