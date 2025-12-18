"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ManagerSidebar from "../../_components/navigation-sidebar";
import EmployeeSidebar from "../../_components/navigation-sidebar/employee";
import { getUserMode } from "../../_components/utils/dashboard-title-mapping";

export default function ContractLayout({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mode, setMode] = useState<string>("HR");

    useEffect(() => {
        // Đọc mode từ localStorage
        const currentMode = getUserMode();
        setMode(currentMode);

        // Lắng nghe thay đổi localStorage từ các tab/component khác
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "scpm.user.mode" && e.newValue) {
                setMode(e.newValue);
            }
        };

        // Lắng nghe custom event cho cùng tab
        const handleModeChange = () => {
            const updatedMode = getUserMode();
            setMode(updatedMode);
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("modeChanged", handleModeChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("modeChanged", handleModeChange);
        };
    }, [pathname]);

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