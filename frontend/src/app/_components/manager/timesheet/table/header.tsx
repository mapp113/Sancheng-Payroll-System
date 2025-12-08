export default function TimesheetTableHeader() {
  return (
    <thead className="bg-[#F8FAFC] text-left">
      <tr>
        <th className="px-4 py-3 font-medium">Mã nhân viên</th>
        <th className="px-4 py-3 font-medium">Tên</th>
        <th className="px-4 py-3 font-medium">Chức vụ</th>
        <th className="px-4 py-3 font-medium">Thời gian làm việc<br />(chưa bao gồm OT)</th>
        <th className="px-4 py-3 font-medium">Làm thêm</th>
        <th className="px-4 py-3 font-medium text-center">Nghỉ phép năm đã dùng</th>
        <th className="px-4 py-3 font-medium"/>
      </tr>
    </thead>
  );
}