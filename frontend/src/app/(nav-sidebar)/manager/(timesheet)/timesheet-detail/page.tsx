"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import ManagerTimesheetDetail from "@/app/_components/manager-timesheet-detail";
import { managerTimesheetDetail } from "@/app/_components/manager-timesheet-detail/data/manager";
import ManagerTimesheetDetailToolbar from "@/app/_components/manager-timesheet-detail/toolbar";
import { ManagerTimeSheetDetailParam } from "@/app/_components/manager-timesheet-detail/types";
import { TimesheetDetailParam } from "@/app/_components/manager-timesheet-detail/context";

function ManagerTimesheetDetailContent() {
    const searchParams = useSearchParams();
    const timesheetDetailParams: ManagerTimeSheetDetailParam = {
        employeeCode: searchParams.get("employeeCode") ?? "",
        month: searchParams.get("month") ?? "",
    };
    const [activeTab, setActiveTab] = useState(() =>
        managerTimesheetDetail.tabs.find((tab) => tab.isActive)?.label ??
        managerTimesheetDetail.tabs[0]?.label ??
        ""
    );

    const tabs = useMemo(
        () =>
            managerTimesheetDetail.tabs.map((tab) => ({
                ...tab,
                isActive: tab.label === activeTab,
            })),
        [activeTab]
    );

    const view = activeTab === "Khác" ? "other" : "timesheet";

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12">
            <TimesheetDetailParam.Provider value={timesheetDetailParams}>
                <ManagerTimesheetDetailToolbar
                    title={managerTimesheetDetail.dashboardTitle}
                    contextLabel={managerTimesheetDetail.title}
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <ManagerTimesheetDetail detail={managerTimesheetDetail} view={view} />
            </TimesheetDetailParam.Provider>
        </div>
    );
}

export default function ManagerTimesheetDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ManagerTimesheetDetailContent />
        </Suspense>
    );
}
