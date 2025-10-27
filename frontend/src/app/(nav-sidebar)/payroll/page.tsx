"use client"

import { DataContext, ParamsContext } from "@/app/_components/payroll/payroll-context";
import PayrollTable from "@/app/_components/payroll/table";
import PayrollToolbar from "@/app/_components/payroll/toolbar";
import { PayrollParam, PayrollRecord } from "@/app/_components/payroll/type";
import { useState } from "react";


export default function PayrollPage() {
  const [payrollParams, setPayrollParams] = useState<PayrollParam>({
    keyword: "",
    filter: "",
    date: new Date().toISOString().slice(0, 7),
    page: "0",
    totalPage: "",
  });
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
  
  return (
    <ParamsContext.Provider value={{ payrollParams, setPayrollParams }}>
      <DataContext.Provider value={{ payrollData, setPayrollData }}>
        <PayrollToolbar />
        <PayrollTable />
      </DataContext.Provider>
    </ParamsContext.Provider>
  );
}
