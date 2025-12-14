import { useContext } from "react";
import { DataContext, ParamsContext } from "../timesheet-context";
import { TimesheetQuery } from "../query";
import { Search } from "lucide-react";

export default function TimesheetToolbar() {
  const param = useContext(ParamsContext)!;
  const data = useContext(DataContext)!;
  const dateChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    param.setTimesheetParams({
      ...param.timesheetParams,
      date: e.target.value,
    });
    const newDate = {
      ...param.timesheetParams,
      date: (e.target as HTMLInputElement).value,
    };
    TimesheetQuery(newDate).then((dataResponse) => {
      data.setTimesheetData(dataResponse.content);
      param.setTimesheetParams((prev) => ({
        ...prev,
        totalPages: dataResponse.size?.toString(),
      }));
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-[#94A3B8]" />
          <input
            placeholder="Tìm kiếm"
            className="w-full rounded-full border border-[#E2E8F0] py-2 pl-9 pr-3 text-sm focus:border-[#4AB4DE] focus:outline-none"
            defaultValue={param.timesheetParams.keyword}
            onKeyDown={(e) => {
              if ((e as React.KeyboardEvent<HTMLInputElement>).key === "Enter") {
                param.setTimesheetParams((prev) => ({
                  ...prev,
                  keyword: (e.target as HTMLInputElement).value,
                  index: "0",
                }));
                const newParams = {
                  ...param.timesheetParams,
                  keyword: (e.target as HTMLInputElement).value,
                };

                TimesheetQuery(newParams).then((dataResponse) => {
                  data.setTimesheetData(dataResponse.content);
                  param.setTimesheetParams((prev) => ({
                    ...prev,
                    totalPages: dataResponse.size.toString(),
                  }));
                });
              }
            }}
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-full border border-[#E2E8F0] px-3 py-2">
          <input
            className="focus:outline-0 text-sm bg-transparent"
            type="month"
            onChange={dateChangeHandler}
            value={param.timesheetParams.date}
          />
        </div>
      </div>
    </div>
  );
}