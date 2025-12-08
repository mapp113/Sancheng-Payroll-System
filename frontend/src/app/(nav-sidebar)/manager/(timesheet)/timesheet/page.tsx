"use client"

import TimesheetTable from "@/app/_components/manager/timesheet/table";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateDraftParams, TimesheetParam, TimesheetRecord } from "@/app/_components/manager/timesheet/type";
import { CreateDraftParamContext, ParamsContext } from "@/app/_components/manager/timesheet/timesheet-context";
import { DataContext } from "@/app/_components/manager/timesheet/timesheet-context";
import FormPopBox from "@/app/_components/common/pop-box/form";
import { X } from "lucide-react";
import CreateDraft, { createDraftQuery } from "@/app/_components/manager/timesheet/create-draft";
import { NotificationProvider } from "@/app/_components/common/pop-box/notification/notification-context";
import BottomRightNotification from "@/app/_components/common/pop-box/notification/bottom-right";
import ConfirmPopBox from "@/app/_components/common/pop-box/confirm";

function TimesheetPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Khôi phục state từ URL params
  const [timesheetParams, setTimesheetParams] = useState<TimesheetParam>({
    keyword: searchParams.get("search") || "",
    date: searchParams.get("month") || (true ? new Date().toISOString().slice(0, 7) : "2025-10"),
    index: searchParams.get("page") || "0",
    totalPages: "",
  });
  const [timesheetData, setTimesheetData] = useState<TimesheetRecord[]>([]);
  const [showFormPopBox, setShowFormPopBox] = useState(false);
  const [createDraftParams, setCreateDraftParams] = useState<CreateDraftParams | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<{
    successCount: number;
    errors: string[];
  } | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  // Lấy role của user từ session storage
  useEffect(() => {
    const userDataString = sessionStorage.getItem("scpm.auth.user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUserRole(userData.role || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Cập nhật URL params khi state thay đổi
  useEffect(() => {
    const urlParams = new URLSearchParams();
    urlParams.set("page", timesheetParams.index);
    urlParams.set("month", timesheetParams.date);
    if (timesheetParams.keyword) {
      urlParams.set("search", timesheetParams.keyword);
    }
    router.replace(`?${urlParams.toString()}`, { scroll: false });
  }, [timesheetParams.index, timesheetParams.date, timesheetParams.keyword, router]);

  const handleCreateDraft = async () => {
    if (!createDraftParams || createDraftParams.employeeCode.length === 0) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await createDraftQuery(createDraftParams);
      
      // Đóng form popup
      setShowFormPopBox(false);
      
      // Parse response nếu là string
      let parsedResponse = response;
      if (typeof response === 'string') {
        try {
          parsedResponse = JSON.parse(response);
        } catch {
          parsedResponse = { message: response, errors: [] };
        }
      }
      
      // Hiển thị confirm box với kết quả
      setConfirmMessage({
        successCount: createDraftParams.employeeCode.length - (parsedResponse.errors?.length || 0),
        errors: parsedResponse.errors || []
      });
      setShowConfirm(true);
      
    } catch (error) {
      console.error("Error creating draft:", error);
      
      // Xử lý error có thể là string JSON
      let errorMessage = "Lỗi không xác định";
      let errorList: string[] = [];
      
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.message || error.message;
          errorList = parsedError.errors || [];
        } catch {
          errorMessage = error.message;
        }
      }
      
      // Hiển thị lỗi trong confirm box
      setConfirmMessage({
        successCount: 0,
        errors: errorList.length > 0 ? errorList : [errorMessage]
      });
      setShowFormPopBox(false);
      setShowConfirm(true);
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmClose = () => {
    setShowConfirm(false);
    setConfirmMessage(null);
    setCreateDraftParams(null);
  };

  const handleConfirmNavigate = () => {
    setShowConfirm(false);
    setConfirmMessage(null);
    setCreateDraftParams(null);
    
    // Tạo URL params với search và month
    const urlParams = new URLSearchParams();
    urlParams.set("month", timesheetParams.date);
    if (timesheetParams.keyword) {
      urlParams.set("search", timesheetParams.keyword);
    }
    
    router.push(`/payroll?${urlParams.toString()}`);
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
              <button 
                className={`mt-4 mr-4 px-4 py-2 text-white rounded ${
                  isCreating 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                }`}
                onClick={handleCreateDraft}
                disabled={isCreating}
              >
                {isCreating ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </FormPopBox>
        )}
        
        {showConfirm && confirmMessage && (
          <ConfirmPopBox
            title="Kết quả tạo bảng lương"
            message={
              <div className="space-y-2">
                <p>Đã tạo xong cho {confirmMessage.successCount} nhân viên</p>
                {confirmMessage.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-red-600">Có lỗi khi tạo những nhân viên:</p>
                    <ul className="list-disc list-inside mt-1 text-sm">
                      {confirmMessage.errors.map((error, index) => (
                        <li key={index} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-4">Bạn có muốn chuyển sang trang phiếu lương không?</p>
              </div>
            }
            onConfirm={handleConfirmNavigate}
            onCancel={handleConfirmClose}
            confirmText="OK"
            cancelText="Đóng"
          />
        )}
        <div className="flex h-full flex-col gap-4 bg-[#eaf5ff] p-4 md:p-6">
          <header className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-semibold">Quản Lý Bảng Chấm Công</h1>
              {userRole === "HR" && (
                <button
                  className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a9bc5] transition-colors cursor-pointer"
                  onClick={() => setShowFormPopBox(true)}
                >
                  Tạo bảng lương nháp
                </button>
              )}
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:overflow-hidden">
            <section className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm flex flex-col">
              <div className="flex-1 overflow-hidden">
                <TimesheetTable />
              </div>
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