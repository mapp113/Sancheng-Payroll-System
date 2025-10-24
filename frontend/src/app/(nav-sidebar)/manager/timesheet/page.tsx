"use client"

import { timesheetQuery } from "@/app/_components/manager/timesheet/timesheet-param";
import TimesheetToolbar from "@/app/_components/manager/timesheet/toolbar";
import TimesheetTable from "@/app/_components/manager/timesheet/table";
import { useCallback, useState, useEffect } from "react";

export default function TimesheetPage() {
  const param: timesheetQuery = {
    keyword: useState(""),
    date: useState(""),
    index: useState("1"),
  }
  const [reloadFlag, setReloadFlag] = useState(0);
  
  const triggerReload = useCallback(() => {
    setReloadFlag((f) => f + 1);
  }, []);

  // Auto reload when page changes
  useEffect(() => {
    triggerReload();
  }, [triggerReload]);

  // Reset page when search keyword changes
  useEffect(() => {
    param.index[1]("1");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param.keyword[0]]);

  return (
    <div className="flex flex-col h-full p-3 box-border">
      <TimesheetToolbar param={param} onReload={triggerReload} />
      <div className="flex-1 mt-2">
        <section className="h-full rounded-xl flex flex-col justify-between">
          <TimesheetTable param={param} reloadFlag={reloadFlag} />
        </section>
      </div>
    </div>);
}