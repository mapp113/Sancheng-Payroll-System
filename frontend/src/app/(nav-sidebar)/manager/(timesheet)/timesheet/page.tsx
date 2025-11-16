"use client"

import TimesheetToolbar from "@/app/_components/manager/timesheet/toolbar";
import TimesheetTable from "@/app/_components/manager/timesheet/table";
import { useState } from "react";
import { TimesheetParam, TimesheetRecord } from "@/app/_components/manager/timesheet/type";
import { ParamsContext } from "@/app/_components/manager/timesheet/timesheet-context";
import { DataContext } from "@/app/_components/manager/timesheet/timesheet-context";

export default function TimesheetPage() {
  const [timesheetParams, setTimesheetParams] = useState<TimesheetParam>({
    keyword: "",
    date: false ? new Date().toISOString().slice(0, 7) : "2025-10",
    index: "0",
    totalPages: "",
  });
  const [timesheetData, setTimesheetData] = useState<TimesheetRecord[]>([]);

  return (
    <ParamsContext.Provider value={{ timesheetParams, setTimesheetParams }}>
      <DataContext.Provider value={{ timesheetData, setTimesheetData }}>
        <div className="flex flex-col h-full p-3 box-border">
          <TimesheetToolbar />
          <div className="flex-1 mt-2">
            <section className="h-full rounded-xl flex flex-col justify-between">
              <TimesheetTable />
            </section>
          </div>
        </div>
      </DataContext.Provider>
    </ParamsContext.Provider>
  );
}