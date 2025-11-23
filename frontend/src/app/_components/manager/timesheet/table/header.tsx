export default function TimesheetTableHeader() {
  return (
    <thead className="bg-gray-200">
      <tr>
        <th className="px-4 py-3 text-left font-semibold">Mã nhân viên</th>
        <th className="px-4 py-3 text-left font-semibold">Tên</th>
        <th className="px-4 py-3 text-left font-semibold">Chức vụ</th>
        <th className="px-4 py-3 text-left font-semibold">Số giờ làm việc</th>
        <th className="px-4 py-3 text-center font-semibold">Nghỉ phép năm đã dùng</th>
        <th className="px-4 py-3 text-left font-semibold"/>
      </tr>
    </thead>
  );
}