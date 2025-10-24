"use client"

import PayrollTable from "@/app/_components/payroll-table";
import PayrollToolbar from "@/app/_components/payroll-toolbar";
import { useCallback, useState } from "react";



export default function PayrollPage() {
  const filter = useState("");
  const search = useState("");
  const date = useState("");
  const page = useState("")
  const [reloadFlag, setReloadFlag] = useState(0);
  const triggerReload = useCallback(() => {
    setReloadFlag((f) => f + 1); // đổi giá trị -> PayrollPage chạy lại useEffect
  }, []);
  
  return (
    <div className="flex flex-col h-full p-3 box-border">
      <PayrollToolbar filter={filter} search={search} date={date} index={page} onReload={triggerReload}/>
      <div className="flex-1 mt-2">
        {/* Vùng bảng chiếm hết phần còn lại, không cuộn */}
        <section className="h-full rounded-xl flex flex-col justify-between">
          <PayrollTable filter={filter} search={search} date={date} index={page} reloadFlag={reloadFlag}/>
        </section>
      </div>
    </div>
  );
}
