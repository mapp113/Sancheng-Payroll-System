import { useContext, useEffect, useState } from "react";
import { DataContext, ParamsContext } from "../timesheet-context";
import { TimesheetQuery } from "../query";

export default function TimesheetTableBody() {
  const params = useContext(ParamsContext)!;
  const data = useContext(DataContext)!;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    TimesheetQuery(params.timesheetParams).then((dataResponse) => {
      data.setTimesheetData(dataResponse.content);
      params.setTimesheetParams((prev) => ({
        ...prev,
        totalPages: dataResponse.size.toString(),
      }));
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="text-center py-6">
            Loading...
          </td>
        </tr>
      </tbody>
    );
  }

  if (!data.timesheetData.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="text-center py-6">
            No data
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {data.timesheetData.map((record) => (
        <tr key={record.employeeCode} className="hover:bg-gray-50">
          <td className="py-3 px-4">{record.employeeCode}</td>
          <td className="py-3 px-4">{record.fullName}</td>
          <td className="py-3 px-4">{record.positionName}</td>
          <td className="py-3 px-4"><div>{`Total time: ${record.daysHours}h`}</div><div>{`OT: ${record.otHours}h`}</div></td>
          <td className="py-3 px-4 text-center">{record.usedleave}</td>
          <td className="py-3 px-4">
            <a href={`timesheet-detail?employeeCode=${record.employeeCode}&month=${params.timesheetParams.date}`} className="px-2 py-1 rounded-xl bg-[#79dee9] cursor-pointer">Chi tiết</a>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
