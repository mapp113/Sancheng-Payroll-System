import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DataContext, ParamsContext } from "../timesheet-context";
import { useContext } from "react";
import { TimesheetQuery } from "../query";
export default function Pagination() {
  const params = useContext(ParamsContext)!;
  const data = useContext(DataContext)!;

  const setPageHandler = async (newPage: string) => {
    params.setTimesheetParams({
      ...params.timesheetParams,
      index: newPage,
    });
    const newParams = {
      ...params.timesheetParams,
      index: newPage,
    };
    TimesheetQuery(newParams).then((dataResponse) => {
      data.setTimesheetData(dataResponse.content);
      params.setTimesheetParams((prev) => ({
        ...prev,
        totalPages: dataResponse.size.toString(),
      }));
    });
  };
  const switchPageHandler = (direction: "next" | "prev") => {
    const currentPage = parseInt(params.timesheetParams.index, 10);
    let newPage = currentPage;
    if (direction === "next" && currentPage < parseInt(params.timesheetParams.totalPages, 10)-1) {
      newPage += 1;
      setPageHandler(newPage.toString());
    } else if (direction === "prev" && currentPage > 0) {
      newPage -= 1;
      setPageHandler(newPage.toString());
    }
  };

  return (
    <div className="flex justify-end items-center py-4">
      <div className="flex space-x-2">
        <button className="cursor-pointer" onClick={() => setPageHandler("0")}><ChevronsLeft /></button>
        <button className="cursor-pointer" onClick={() => switchPageHandler("prev")}><ChevronLeft /></button>
        <span>Trang {parseInt(params.timesheetParams.index, 10) + 1} trên {parseInt(params.timesheetParams.totalPages, 10)}</span>
        <button className="cursor-pointer" onClick={() => switchPageHandler("next")}><ChevronRight /></button>
        <button className="cursor-pointer" onClick={() => setPageHandler(params.timesheetParams.totalPages.toString())}><ChevronsRight /></button>
      </div>
    </div>
  );
}
