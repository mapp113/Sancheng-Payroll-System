import type {ReactNode} from "react";
import Sidebar from "../../../_components/navigation-sidebar/index";

export default function SalaryLayout({children}: { children: ReactNode }) {
    return (
        <div className="flex flex-1">
            <div className="w-20">
                <Sidebar select={3}/>
            </div>
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}