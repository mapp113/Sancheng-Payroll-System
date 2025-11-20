import Sidebar from "../../_components/navigation-sidebar/employee";

export default function EmployeesLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1">
            <div className="w-20">
                <Sidebar select={1}/>
            </div>
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}