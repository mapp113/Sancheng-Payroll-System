import Image from "next/image"

export default function NavigationSidebar() {
  return (
    <aside className="fixed top-16 bottom-0 left-0 z-40 w-20 bg-[#CCE1F0] p-4 flex flex-col items-center">
      <ul className="space-y-2">
        <li>
          <a href="/employees" className="hover:underline">
            <Image src="/icons/employee.png" alt="Employees" width={52} height={52} />
          </a>
        </li>
        <li>
          <a href="/attendance" className="hover:underline">
            <Image src="/icons/attendance.png" alt="Attendance" width={52} height={52} />
          </a>
        </li>
        <li>
          <a href="/contract" className="hover:underline">
            <Image src="/icons/contract.png" alt="Contact" width={52} height={52} />
          </a>
        </li>
        <li className="rounded-xl bg-[#4AB4DE]">
          <a href="/payroll" className="hover:underline ">
            <Image src="/icons/payroll.png" alt="Payroll" width={52} height={52} />
          </a>
        </li>
        <li>
          <a href="/reports" className="hover:underline">
            <Image src="/icons/report.png" alt="Reports" width={52} height={52} />
          </a>
        </li>
      </ul>
    </aside>
  );
}
