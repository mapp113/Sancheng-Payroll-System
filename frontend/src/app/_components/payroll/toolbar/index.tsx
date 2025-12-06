import { FormEvent, useContext } from "react";
import { DataContext, ParamsContext } from "../payroll-context";
import { CloudUpload, SearchIcon } from "lucide-react";
import FilterButton from "./filter-button";
import { PayrollQuery } from "../query";
import { useNotification } from "../../common/pop-box/notification/notification-context";

export default function PayrollToolbar() {
  const params = useContext(ParamsContext);
  const payrollData = useContext(DataContext)!;
  const { addNotification } = useNotification();
  const exportButtonHandler = async () => {
    if (!params?.payrollParams.date) {
      addNotification("error", "Lỗi", "Vui lòng chọn tháng để xuất dữ liệu", 3000);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/payroll-export?month=${params.payrollParams.date}-01`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("scpm.auth.token")}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Xuất file thất bại');
      }

      // Lấy filename từ header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'payroll.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Tải file xuống
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addNotification("ok", "Thành công", "Xuất file Excel thành công", 3000);
    } catch (error) {
      console.error('Lỗi khi xuất file:', error);
      addNotification("error", "Lỗi", "Có lỗi xảy ra khi xuất file Excel", 3000);
    }
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
          Xuất sang Excel
        </button>
      </div>
    </div>
  );
}
