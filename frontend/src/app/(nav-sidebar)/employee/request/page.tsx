import LeavesToolBar from "@/app/_components/employee/request/tool-bar";

export default function LeavesPage() {
  return (
    <div className="p-2">
      <LeavesToolBar />
      <div className="flex flex-row w-full">
        <h2 className="font-bold">Yêu cầu xin nghỉ</h2>
        <span className="flex-1 text-center">Số ngày nghỉ còn lại trong tháng: </span>
      </div>
      <div className="flex flex-row w-full">
        <h2 className="font-bold">Yêu cầu Overtime</h2>
        <span className="flex-1 text-center">Số giờ OT còn lại trong tuần:</span>
      </div>
    </div>
  );
}