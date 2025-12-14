import TimesheetTableHeader from "./header";
import TimesheetTableBody from "./body";
import TimesheetToolbar from "./toolbar";
import Pagination from "./pagination";

export default function TimesheetTable() {
  
  return (
    <div className="h-full w-full flex flex-col">
      <TimesheetToolbar />
      <div className="flex-1 overflow-auto rounded-2xl border border-[#E2E8F0]">
        <table className="min-w-full divide-y divide-[#E2E8F0]">
          <TimesheetTableHeader />
          <TimesheetTableBody />
        </table>
      </div>
      <Pagination />
    </div>
  );
}
