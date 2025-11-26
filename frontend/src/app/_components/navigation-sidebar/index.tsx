import Image from "next/image"

export default function NavigationSidebar({select}: { select: number }) {
    const selected = "rounded-xl bg-[#4AB4DE]";

    return (
        <aside className="fixed top-16 bottom-0 left-0 z-40 w-20 bg-[#CCE1F0] p-4 flex flex-col items-center">
            <ul className="space-y-2">
                <li className={`${select === 1 ? selected : ""}`}>
                    <a href="/contract" className="hover:underline">
                        <Image src="/icons/employee.png" alt="Employees" width={52} height={52}/>
                    </a>
                </li>
                <li className={`${select === 2 ? selected : ""}`}>
                    <a href="/manager/timesheet" className="hover:underline">
                        <Image src="/icons/attendance.png" alt="Attendance" width={52} height={52}/>
                    </a>
                </li>
                {/*<li className={`${select === 3 ? selected : ""}`}>*/}
                {/*    <a href="/contracts" className="hover:underline">*/}
                {/*        <Image src="/icons/contract.png" alt="Contact" width={52} height={52}/>*/}
                {/*    </a>*/}
                {/*</li>*/}
                <li className={`${select === 4 ? selected : ""}`}>
                    <a href="/payroll" className="hover:underline ">
                        <Image src="/icons/payroll.png" alt="Payroll" width={52} height={52}/>
                    </a>
                </li>
                <li className={`${select === 5 ? selected : ""}`}>
                    <a href="/reports" className="hover:underline">
                        <Image src="/icons/report.png" alt="Reports" width={52} height={52}/>
                    </a>
                </li>
                <li className={`${select === 6 ? selected : ""}`}>
                    <a href="/manager/requests/leaves" className="hover:underline">
                        <Image src="/icons/leave-request.png" alt="Leave Request" width={52} height={52}/>
                    </a>
                </li>
                <li className={`${select === 7 ? selected : ""}`}>
                    <a href="/manager/requests/overtime" className="hover:underline">
                        <Image src="/icons/overtime-request.png" alt="Overtime Request" width={52} height={52}/>
                    </a>
                </li>
                <li className={`${select === 8 ? selected : ""}`}>
                    <a href="/manager/tax-insurance" className="hover:underline">
                        <Image src="/icons/employee/tax.png" alt="Overtime Request" width={52} height={52}/>
                    </a>
                </li>
            </ul>
        </aside>
    );
}
