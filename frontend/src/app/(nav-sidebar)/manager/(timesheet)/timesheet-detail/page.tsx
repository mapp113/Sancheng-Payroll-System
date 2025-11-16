"use client";

import {useMemo, useState} from "react";

import ManagerTimesheetDetail from "@/app/_components/manager-timesheet-detail";
import {managerTimesheetDetail} from "@/app/_components/manager-timesheet-detail/data/manager";
import ManagerTimesheetDetailToolbar from "@/app/_components/manager-timesheet-detail/toolbar";

export default function ManagerTimesheetDetailPage() {
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

    const view = activeTab === "Other" ? "other" : "timesheet";

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 pb-12">
            <ManagerTimesheetDetailToolbar
                title={managerTimesheetDetail.dashboardTitle}
                contextLabel={managerTimesheetDetail.title}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <ManagerTimesheetDetail detail={managerTimesheetDetail} view={view}/>
        </div>
    );
}
