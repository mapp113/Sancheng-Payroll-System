"use client"

import TimesheetToolbar from "@/app/_components/manager/timesheet/toolbar";
import TimesheetTable from "@/app/_components/manager/timesheet/table";
import { useState } from "react";
import { CreateDraftParams, TimesheetParam, TimesheetRecord } from "@/app/_components/manager/timesheet/type";
import { CreateDraftParamContext, ParamsContext } from "@/app/_components/manager/timesheet/timesheet-context";
import { DataContext } from "@/app/_components/manager/timesheet/timesheet-context";
import FormPopBox from "@/app/_components/common/pop-box/form";
import { User, Users, X } from "lucide-react";
import CreateDraft from "@/app/_components/manager/timesheet/create-draft";

export default function TimesheetPage() {
  const [timesheetParams, setTimesheetParams] = useState<TimesheetParam>({
    keyword: "",
    date: false ? new Date().toISOString().slice(0, 7) : "2025-10",
    index: "0",
    totalPages: "",
  });
  const [timesheetData, setTimesheetData] = useState<TimesheetRecord[]>([]);
  const [showFormPopBox, setShowFormPopBox] = useState(false);
  const [createDraftParams, setCreateDraftParams] = useState<CreateDraftParams | null>(null);

  return (
    <ParamsContext.Provider value={{ timesheetParams, setTimesheetParams }}>
      <DataContext.Provider value={{ timesheetData, setTimesheetData }}>
        {showFormPopBox && (
          <FormPopBox>
            <div className="flex justify-end mb-2"><X className="cursor-pointer" onClick={() => setShowFormPopBox(false)} /></div>
            <div className="text-center font-bold text-xl mb-2">Tạo bản nháp</div>
            {/* <div className="flex flex-row gap-4 border border-black rounded-xl p-1 justify-center">
              <button className="p-2 rounded-xl hover:bg-gray-200 cursor-pointer"><User className="inline"/>Một nhân viên</button>
              <button className="p-2 rounded-xl hover:bg-gray-200 cursor-pointer"><Users className="inline"/>Nhiều nhân viên</button>
            </div> */}
            <div className="w-full h-fit max-h-1/2">
              <CreateDraftParamContext.Provider value={{ createDraftParams, setCreateDraftParams }}>
                <CreateDraft />
              </CreateDraftParamContext.Provider>
            </div>
            <div className="w-full flex justify-end">
              <button className="mt-4 mr-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">Tạo</button>
            </div>
          
          </FormPopBox>
        )}
        <div className="flex flex-col h-full p-3 box-border">
          <TimesheetToolbar showForm={() => setShowFormPopBox(true)} />
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