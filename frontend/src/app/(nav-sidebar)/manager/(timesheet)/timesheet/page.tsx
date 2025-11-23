"use client"

import TimesheetToolbar from "@/app/_components/manager/timesheet/toolbar";
import TimesheetTable from "@/app/_components/manager/timesheet/table";
import { useState } from "react";
import { CreateDraftParams, TimesheetParam, TimesheetRecord } from "@/app/_components/manager/timesheet/type";
import { CreateDraftParamContext, ParamsContext } from "@/app/_components/manager/timesheet/timesheet-context";
import { DataContext } from "@/app/_components/manager/timesheet/timesheet-context";
import FormPopBox from "@/app/_components/common/pop-box/form";
import { X } from "lucide-react";
import CreateDraft, { createDraftQuery } from "@/app/_components/manager/timesheet/create-draft";
import { NotificationProvider, useNotification } from "@/app/_components/common/pop-box/notification/notification-context";
import BottomRightNotification from "@/app/_components/common/pop-box/notification/bottom-right";

function TimesheetPageContent() {
  const { addNotification } = useNotification();
  const [timesheetParams, setTimesheetParams] = useState<TimesheetParam>({
    keyword: "",
    date: true ? new Date().toISOString().slice(0, 7) : "2025-10",
    index: "0",
    totalPages: "",
  });
  const [timesheetData, setTimesheetData] = useState<TimesheetRecord[]>([]);
  const [showFormPopBox, setShowFormPopBox] = useState(false);
  const [createDraftParams, setCreateDraftParams] = useState<CreateDraftParams | null>(null);

  const handleCreateDraft = async () => {
    if (!createDraftParams) {
      addNotification("error", "Lỗi", "Vui lòng chọn ít nhất một nhân viên", 3000);
      return;
    }

    try {
      const response = await createDraftQuery(createDraftParams);
      
      if (response.message) {
        addNotification("ok", "Thành công", response.message, 7000);
      }
      
      if (response.errors && response.errors.length > 0) {
        response.errors.forEach((error: string) => {
          addNotification("error", "Lỗi", error, 7000);
        });
      }

      // Đóng popup nếu thành công
      if (response.message && (!response.errors || response.errors.length === 0)) {
        setShowFormPopBox(false);
        setCreateDraftParams(null);
      }
    } catch (error) {
      console.error("Error creating draft:", error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      addNotification("error", "Lỗi", `${errorMessage}`, 7000);
    }
  };

  return (
    <ParamsContext.Provider value={{ timesheetParams, setTimesheetParams }}>
      <DataContext.Provider value={{ timesheetData, setTimesheetData }}>
        {showFormPopBox && (
          <FormPopBox>
            <div className="flex justify-end mb-2"><X className="cursor-pointer" onClick={() => setShowFormPopBox(false)} /></div>
            <div className="text-center font-bold text-xl mb-2">Tạo bảng lương nháp</div>
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
              <button className="mt-4 mr-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer" onClick={handleCreateDraft}>Tạo</button>
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

export default function TimesheetPage() {
  return (
    <NotificationProvider>
      <TimesheetPageContent />
      <BottomRightNotification />
    </NotificationProvider>
  );
}