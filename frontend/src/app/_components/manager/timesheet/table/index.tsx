import TimesheetTableHeader from "./header";
import TimesheetTableBody from "./body";
import { timesheetQuery } from "../timesheet-param";
import TimesheetToolbar from "./toolbar";
import Pagination from "./pagination";

export default function TimesheetTable({
  param,
  reloadFlag,
}: {
  param: timesheetQuery;
  reloadFlag: number;
}) {
  const currentPage = parseInt(param.index[0]);
  const totalPages = 10; // This should come from your API response

  const handlePageChange = (page: number) => {
    param.index[1](page.toString());
  };

  return (
    <div className="h-full w-full bg-white rounded-xl border border-gray-300 overflow-auto flex flex-col">
      <TimesheetToolbar param={param} />
      <div className="flex-1 overflow-auto">
        <table className="min-w-full">
          <TimesheetTableHeader />
          <TimesheetTableBody param={param} reloadFlag={reloadFlag} />
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
