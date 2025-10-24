import type { TimesheetRow } from "../timesheet-param";



export default function TimesheetTableItem({ row }: { row: TimesheetRow }) {
  return (
    <tr className="border-b">
      <td className="px-4 py-2">{row.name}</td>
      <td className="px-4 py-2">{row.position}</td>
      <td className="px-4 py-2">
        <div>Total time: {row.hoursWorked.totalTime}</div>
        <div>Overtime: {row.hoursWorked.overTime}</div>
      </td>
      <td className="px-4 py-2">Total time: {row.timeOff}h</td>
      <td className="px-4 py-2">{row.note}</td>
      <td className="px-4 py-2">
        <button className="text-blue-500 hover:underline">Edit</button>
      </td>
    </tr>
  );
}
