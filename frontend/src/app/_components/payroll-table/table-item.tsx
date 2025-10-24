import { Info } from "lucide-react";

type Status = "green" | "yellow" | "red";

export type PayrollRow = {
  id: string;
  name: string;
  position: string;
  salary: number | string;
  status: Status;
  downloadUrl?: string;
};

const dotClass: Record<Status, string> = {
  green: "bg-lime-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
};

const payrollDetailHandler = () => {
  alert("Detail")
}

export default function PayrollItem({ row }: { row: PayrollRow }) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="px-4 py-4 text-gray-700">{row.id}</td>
      <td className="px-4 py-4 font-medium text-gray-900">{row.name}</td>
      <td className="px-4 py-4 text-gray-700">{row.position}</td>
      <td className="px-4 py-4 text-gray-700">${row.salary}</td>
      <td className="px-4 py-4">
        <span className={`inline-block h-4 w-4 rounded-full ${dotClass[row.status]}`} />
      </td>
      <td className="px-4 py-4">
        <button
          className="rounded-full bg-cyan-300/90 disabled:bg-gray-300/90 px-4 py-1 text-sm font-semibold text-slate-700 shadow cursor-pointer"
          onClick={(e) => {
            if (row.downloadUrl === "" || row.downloadUrl === undefined) {
              //alert("No file available for download");
              (e.target as HTMLButtonElement).disabled = true;
            } else {
              window.open(row.downloadUrl, "_blank");
            }
          }}
        >
          Download
        </button>
      </td>
      <td className="px-4 py-4">
          <Info className="inline-flex h-6 w-6 items-center justify-center cursor-pointer" onClick={payrollDetailHandler}/>
      </td>
    </tr>
  );
}