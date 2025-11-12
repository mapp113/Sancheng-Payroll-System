import Image from "next/image"

export default function NavigationSidebar({ select }: { select: number }) {
  const selected = "rounded-xl bg-[#4AB4DE]";

  return (
    <aside className="fixed top-16 bottom-0 left-0 z-40 w-20 bg-[#CCE1F0] p-4 flex flex-col items-center">
      <ul className="space-y-2">
        <li className={`${select === 1 ? selected : ""}`}>
          <a href="/attendance" className="hover:underline">
            <Image src="/icons/employee/attendance.png" alt="Attendance" width={52} height={52} />
          </a>
        </li>
        <li className={`${select === 2 ? selected : ""}`}>
          <a href="/contract" className="hover:underline">
            <Image src="/icons/employee/contract.png" alt="Contract" width={52} height={52} />
          </a>
        </li>
        <li className={`${select === 3 ? selected : ""}`}>
          <a href="/salary" className="hover:underline">
            <Image src="/icons/employee/payroll.png" alt="Salary" width={52} height={52} />
          </a>
        </li>
        <li className={`${select === 4 ? selected : ""}`}>
          <a href="/request" className="hover:underline ">
            <Image src="/icons/employee/request.png" alt="Request" width={52} height={52} />
          </a>
        </li>
      </ul>
    </aside>
  );
}
