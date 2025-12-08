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
          <td colSpan={7} className="text-center py-6">
            Đang tải...
          </td>
        </tr>
      </tbody>
    );
  }

  if (!data.timesheetData.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={7} className="text-center py-6">
            Không có dữ liệu
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-[#E2E8F0]">
      {data.timesheetData.map((record) => (
        <tr key={record.employeeCode} className="hover:bg-[#F1F5F9]">
          <td className="whitespace-nowrap px-4 py-3 font-medium">{record.employeeCode}</td>
          <td className="whitespace-nowrap px-4 py-3">{record.fullName}</td>
          <td className="whitespace-nowrap px-4 py-3">{record.positionName}</td>
          <td className="whitespace-nowrap px-4 py-3">{record.daysHours}h</td>
          <td className="whitespace-nowrap px-4 py-3">{record.otHours}h</td>
          <td className="whitespace-nowrap px-4 py-3 text-center">{record.usedleave}</td>
          <td className="whitespace-nowrap px-4 py-3 text-right">
            <a href={`timesheet-detail?employeeCode=${record.employeeCode}&month=${params.timesheetParams.date}&page=${params.timesheetParams.index}${params.timesheetParams.keyword ? `&search=${encodeURIComponent(params.timesheetParams.keyword)}` : ''}`} className="rounded-full border border-[#4AB4DE] px-4 py-1 text-xs font-medium text-[#4AB4DE] hover:bg-[#E0F2FE] cursor-pointer inline-block">Chi tiết</a>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
