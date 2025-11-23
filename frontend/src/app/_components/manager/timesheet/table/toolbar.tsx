import { useContext } from "react";
import { DataContext, ParamsContext } from "../timesheet-context";
import { TimesheetQuery } from "../query";

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
        totalPages: dataResponse.size.toString(),
      }));
    });
  }

  return (
    <div className="flex p-3 box-border">
      <span className="mx-5 text-2xl font-bold">
        Bảng chấm công
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center p-1 border border-black rounded-lg">
          <input
            className="focus:outline-0"
            type="month"
            onChange={dateChangeHandler}
            value={param.timesheetParams.date}
          />
        </div>
      </div>
    </div>
  );
}