"use client"

import { DataContext, ParamsContext } from "@/app/_components/payroll/payroll-context";
import PayrollTable from "@/app/_components/payroll/table";
import PayrollToolbar from "@/app/_components/payroll/toolbar";
import { PayrollParam, PayrollRecord } from "@/app/_components/payroll/type";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";


export default function PayrollPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Khôi phục state từ URL params
  const [payrollParams, setPayrollParams] = useState<PayrollParam>({
    keyword: searchParams.get("search") || "",
    sortBy: searchParams.get("sortBy") || "",
    date: searchParams.get("month") || (false ? new Date().toISOString().slice(0, 7) : "2025-10"),
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
        <PayrollToolbar />
        <PayrollTable />
      </DataContext.Provider>
    </ParamsContext.Provider>
  );
}
