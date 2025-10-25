export default function TimesheetTableHeader() {
  return (
    <thead className="bg-gray-200">
      <tr>
        <th className="px-4 py-3 text-left font-semibold">Employee Code</th>
        <th className="px-4 py-3 text-left font-semibold">Name</th>
        <th className="px-4 py-3 text-left font-semibold">Position</th>
        <th className="px-4 py-3 text-left font-semibold">Hour Worked</th>
        <th className="px-4 py-3 text-left font-semibold">Time Off</th>
        <th className="px-4 py-3 text-left font-semibold"/>
      </tr>
    </thead>
  );
}