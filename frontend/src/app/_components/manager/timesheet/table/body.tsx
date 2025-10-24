import { useEffect, useState } from "react";
import { timesheetQuery } from "../timesheet-param";
import TimesheetTableItem from "./table-item";
import type { TimesheetRow } from "../timesheet-param";

const API_URL = "http://your-api-url/timesheets";
const USE_SAMPLE_DATA = true;

const SAMPLE_DATA: TimesheetRow[] = [
  {
    id: "1",
    name: "Nguyen Van A",
    position: "Developer",
    hoursWorked: { totalTime: 160, overTime: 20 },
    timeOff: "2",
    note: "Sick leave",
  },
  {
    id: "2",
    name: "Tran Thi B",
    position: "Designer",
    hoursWorked: { totalTime: 160, overTime: 20 },
    timeOff: "0",
    note: "",
  },
];

async function fetchData(param: timesheetQuery): Promise<TimesheetRow[]> {
  if (USE_SAMPLE_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return SAMPLE_DATA;
  }

  // Build query string from non-empty params
  const queryParams = new URLSearchParams();
  if (param.keyword[0]) queryParams.set('keyword', param.keyword[0]);
  if (param.date[0]) queryParams.set('date', param.date[0]);
  if (param.index[0]) queryParams.set('page', param.index[0]);

  const queryString = queryParams.toString();
  const url = queryString ? `${API_URL}?${queryString}` : API_URL;
  console.log('Fetching data from URL:', url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export default function TimesheetTableBody({
  param,
  reloadFlag,
}: {
  param: timesheetQuery;
  reloadFlag: number;
}) {
  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchData(param)
      .then(setRows)
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param.keyword[0], param.date[0], param.index[0], reloadFlag]);

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

  if (!rows.length) {
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
      {rows.map((row) => (
        <TimesheetTableItem key={row.id} row={row} />
      ))}
    </tbody>
  );
}
