import { Search } from "lucide-react";
import { timesheetQuery } from "../timesheet-param";

const backButtonHandler = () => {
  alert("Back")
}

export default function TimesheetToolbar({ param, onReload }: { param: timesheetQuery; onReload: () => void }) {
  return (
    <div className="flex items-end border-b border-black p-2">
      <button
        id="payroll-toolbar-back-button"
        className="mr-15 py-3 px-5 border rounded-sm text-xs border-black bg-[#89CDFE] text-[#345EA8] hover:bg-[#77b2dd] transition-all cursor-pointer"
        onClick={backButtonHandler}
      >
        BACK
      </button>
      <div className="flex items-center p-1 mr-15 border border-black rounded-xl">
        <Search className="inline mr-1" />
        <input
          id="payroll-toolbar-search-input"
          className="inline focus:outline-0"
          placeholder="Search"
          defaultValue={param.keyword[0]}
          onKeyDown={(e) => {
            if ((e as React.KeyboardEvent<HTMLInputElement>).key === "Enter") {
              param.keyword[1]((e.target as HTMLInputElement).value);
              param.index[1]("1");
              onReload();
            }
          }}
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
        id="payroll-toolbar-back-button"
        className="mr-15 py-3 px-10 border rounded-sm text-xs border-black bg-[#9ee87b] text-[#5a896b] hover:bg-[#91d771] transition-all cursor-pointer"
        onClick={backButtonHandler}
      >
        APPROVE
      </button>
      </div>
    </div>
  );
}