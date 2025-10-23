export default function PayrollHeader() {
  return (
    <thead className="bg-[#CCE1F0] text-gray-800">
      <tr>
        <th className="px-4 py-3 text-left font-semibold">ID</th>
        <th className="px-4 py-3 text-left font-semibold">Name</th>
        <th className="px-4 py-3 text-left font-semibold">Position</th>
        <th className="px-4 py-3 text-left font-semibold">Salary</th>
        <th className="px-4 py-3 text-left font-semibold">Status</th>
        <th className="px-4 py-3 text-left font-semibold">Payslip</th>
        <th className="px-4 py-3" />
      </tr>
    </thead>
  );
}