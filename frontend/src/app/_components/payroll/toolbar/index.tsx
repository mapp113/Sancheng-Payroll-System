import { FormEvent, useContext } from "react";
import { DataContext, ParamsContext } from "../payroll-context";
import { CloudUpload, SearchIcon } from "lucide-react";
import FilterButton from "./filter-button";
import { PayrollQuery } from "../query";

export default function PayrollToolbar() {
  const params = useContext(ParamsContext);
  const payrollData = useContext(DataContext)!;
  const exportButtonHandler = () => {
    alert("Export");
  }

  const searchHandler = async (e: FormEvent<HTMLInputElement>) => {
    if (!params) return;
    params.setPayrollParams({
      ...params.payrollParams,
      keyword: (e.target as HTMLInputElement).value,
    });
    const newParams = {
      ...params.payrollParams,
      keyword: (e.target as HTMLInputElement).value,
    };

    const data = await PayrollQuery(newParams);
    payrollData.setPayrollData(data.content);

    params.setPayrollParams((prev) => ({
      ...prev,
      totalPage: data.size.toString(),
    }));
  };

  const dateInputHandler = async (e: FormEvent<HTMLInputElement>) => {
    if (!params) return;
    params.setPayrollParams({
      ...params.payrollParams,
      date: (e.target as HTMLInputElement).value,
      totalPage: params.payrollParams.totalPage,
    });
    const newParams = {
      ...params.payrollParams,
      date: (e.target as HTMLInputElement).value,
      totalPage: params.payrollParams.totalPage,
    };

    const data = await PayrollQuery(newParams);
    payrollData.setPayrollData(data.content);
    params.setPayrollParams((prev) => ({
      ...prev,
      totalPage: data.size.toString(),
    }));
  };

  return (
    <div className="flex gap-4 mb-4 p-2 flex-row items-end border-b">
      <div className="flex gap-4 items-end">
        <div className="flex items-center px-2 border border-black rounded-xl">
          <SearchIcon className="inline" />
          <input type="text" className="pl-2 focus:outline-none" placeholder="Tìm kiếm..."
            onInput={searchHandler}
          />
        </div>
        <FilterButton />
      </div>
      <div className="flex ml-auto items-end">
        <input type="month" className="px-2 py-1 border rounded-sm border-black focus:outline-none"
          defaultValue={params?.payrollParams.date}
          onInput={dateInputHandler}
        />
        <button className="ml-4 px-2 py-1 border bg-[#7ADFEA] border-black rounded-md items-center cursor-pointer"
          onClick={exportButtonHandler}
        >
          <CloudUpload className="inline" />
          Xuất
        </button>
      </div>
    </div>
  );
}
