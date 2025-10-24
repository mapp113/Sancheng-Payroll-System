import { timesheetQuery } from "@/app/_components/manager/timesheet/timesheet-param";



export default function TimesheetToolbar({ param }: { param: timesheetQuery }) {


  return (
    <div className="flex p-3 box-border">
      <span className="mx-5 text-2xl font-bold">
        List Timesheet
      </span>
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center p-1 border border-black rounded-lg">
          <input
            className="focus:outline-0"
            type="month" onChange={(e) => param.date[1](e.target.value)} />
        </div>
      </div>
    </div>
  );
}