"use client";
import { useEffect, useState } from "react";
import ManagerSidebar from "../../_components/navigation-sidebar";
import EmployeeSidebar from "../../_components/navigation-sidebar/employee";
import { getUserMode } from "../../_components/utils/dashboard-title-mapping";

export default function ContractLayout({children}: { children: React.ReactNode }) {
    const [mode, setMode] = useState<string>("HR");

    useEffect(() => {
        const currentMode = getUserMode();
        setMode(currentMode);
    }, []);

    const SidebarComponent = mode === "EMPLOYEE" ? EmployeeSidebar : ManagerSidebar;

    return (
        <div className="flex flex-1">
            <div className="w-20">
                <SidebarComponent select={1}/>
            </div>
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    );
}