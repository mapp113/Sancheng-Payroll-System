import { useContext } from "react";
import { DataContext, ParamsContext } from "../payroll-context";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { PayrollQuery } from "../query";

export default function Pagination() {
  const payrollParams = useContext(ParamsContext)!;
  const payrollData = useContext(DataContext)!;
  const setPageHandler = async (newPage: string) => {
    // 1. cập nhật state/context cho UI
    payrollParams.setPayrollParams({
      ...payrollParams.payrollParams,
      page: newPage,
    });

    // 2. gọi API dùng chính newPage đó
    const newParams = {
      ...payrollParams.payrollParams,
      page: newPage,
    };

    const data = await PayrollQuery(newParams);
    payrollData.setPayrollData(data.content);
  };
  const switchPageHandler = (direction: "next" | "prev") => {
    const currentPage = parseInt(payrollParams.payrollParams.page, 10);
    let newPage = currentPage;
    if (direction === "next" && currentPage < parseInt(payrollParams.payrollParams.totalPage, 10)-1) {
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
        <span>Trang {parseInt(payrollParams.payrollParams.page, 10) + 1} trên {parseInt(payrollParams.payrollParams.totalPage, 10)}</span>
        <button className="cursor-pointer" onClick={() => switchPageHandler("next")}><ChevronRight /></button>
        <button className="cursor-pointer" onClick={() => setPageHandler(payrollParams.payrollParams.totalPage.toString())}><ChevronsRight /></button>
      </div>
    </div>
  );
}
