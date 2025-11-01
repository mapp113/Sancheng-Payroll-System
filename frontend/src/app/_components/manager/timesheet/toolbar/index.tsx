import { Search } from "lucide-react";
import { useContext } from "react";
import { DataContext, ParamsContext } from "../timesheet-context";
import { TimesheetQuery } from "../query";

const backButtonHandler = () => {
  alert("Back")
}

export default function TimesheetToolbar() {
  const params = useContext(ParamsContext)!;
  const data = useContext(DataContext)!;

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
          defaultValue={params?.timesheetParams.keyword}
          onKeyDown={(e) => {
            if ((e as React.KeyboardEvent<HTMLInputElement>).key === "Enter") {
              params.setTimesheetParams((prev) => ({
                ...prev,
                keyword: (e.target as HTMLInputElement).value,
                index: "0",
              }));
              const newParams = {
                ...params.timesheetParams,
                keyword: (e.target as HTMLInputElement).value,
              };

              TimesheetQuery(newParams).then((dataResponse) => {
                data.setTimesheetData(dataResponse.content);
                params.setTimesheetParams((prev) => ({
                  ...prev,
                  totalPages: dataResponse.size.toString(),
                }));
              });
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
          Create DRAFT
        </button>
      </div>
    </div>
  );
}