import { useContext, useEffect, useState } from "react";
import { CreateDraftParamContext, ParamsContext } from "./timesheet-context";
import { TimesheetQuery } from "./query";
import type { CreateDraftParams, TimesheetRecord } from "./type";

export default function CreateDraft() {
  const context = useContext(CreateDraftParamContext);
  const params = useContext(ParamsContext);
  const [employees, setEmployees] = useState<TimesheetRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách nhân viên
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!params?.timesheetParams.date) return;
      
      setLoading(true);
      try {
        // Gọi trang đầu tiên để lấy totalPages
        const firstResult = await TimesheetQuery({
          keyword: params.timesheetParams.keyword || "",
          date: params.timesheetParams.date,
          index: "0",
          totalPages: "0"
        });

        // Nếu chỉ có 1 trang, dùng kết quả đầu tiên
        if (firstResult.size <= 1) {
          setEmployees(firstResult.content);
          return;
        }

        // Gọi các trang còn lại song song
        const allEmployees = [...firstResult.content];
        const remainingPages = Array.from(
          { length: firstResult.size - 1 }, 
          (_, i) => i + 1
        );

        const remainingResults = await Promise.all(
          remainingPages.map(pageIndex =>
            TimesheetQuery({
              keyword: params.timesheetParams.keyword || "",
              date: params.timesheetParams.date,
              index: pageIndex.toString(),
              totalPages: firstResult.size.toString()
            })
          )
        );

        // Gộp tất cả kết quả
        remainingResults.forEach(result => {
          allEmployees.push(...result.content);
        });

        setEmployees(allEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [params?.timesheetParams.date, params?.timesheetParams.keyword]);

  // Xử lý khi checkbox được chọn/bỏ chọn
  const handleCheckboxChange = (employeeCode: string, checked: boolean) => {
    if (!context?.setCreateDraftParams) return;

    context.setCreateDraftParams((prev) => {
      if (!prev) {
        return {
          employeeCode: checked ? [employeeCode] : [],
          date: params?.timesheetParams.date || ""
        };
      }

      const updatedCodes = checked
        ? [...prev.employeeCode, employeeCode]
        : prev.employeeCode.filter(code => code !== employeeCode);

      return {
        ...prev,
        employeeCode: updatedCodes
      };
    });
  };

  // Xử lý khi select all checkbox được chọn/bỏ chọn
  const handleSelectAllChange = (checked: boolean) => {
    if (!context?.setCreateDraftParams) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context.setCreateDraftParams((prev) => {
      const allEmployeeCodes = checked 
        ? employees.map(emp => emp.employeeCode)
        : [];

      return {
        employeeCode: allEmployeeCodes,
        date: params?.timesheetParams.date || ""
      };
    });
  };

  // Kiểm tra xem employee có được chọn không
  const isChecked = (employeeCode: string) => {
    return context?.createDraftParams?.employeeCode.includes(employeeCode) || false;
  };

  // Kiểm tra xem tất cả employee có được chọn không
  const isAllChecked = () => {
    if (employees.length === 0) return false;
    return employees.every(emp => isChecked(emp.employeeCode));
  };
  
  return (
    <table className="w-full table-auto">
      <thead className="bg-gray-200 sticky top-0">
        <tr>
          <th className="px-4 py-2 text-left">
            <input 
              id="select-all-checkbox" 
              type="checkbox"
              checked={isAllChecked()}
              onChange={(e) => handleSelectAllChange(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
          </th>
          <th className="px-4 py-2 text-left">Tên nhân viên</th>
          <th className="px-4 py-2 text-left">Mã nhân viên</th>
        </tr>
      </thead>
      <tbody className="overflow-y-auto max-h-1/2">
        {loading ? (
          <tr>
            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
              Đang tải...
            </td>
          </tr>
        ) : employees.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
              Không có nhân viên nào
            </td>
          </tr>
        ) : (
          employees.map((employee) => (
            <tr key={employee.employeeCode} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={isChecked(employee.employeeCode)}
                  onChange={(e) => handleCheckboxChange(employee.employeeCode, e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </td>
              <td className="px-4 py-2">{employee.fullName}</td>
              <td className="px-4 py-2">{employee.employeeCode}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

interface CreateDraftResponse {
  message: string;
  errors: string[];
}

export async function createDraftQuery(param: CreateDraftParams): Promise<CreateDraftResponse> {
  try {
    const token = sessionStorage.getItem("scpm.auth.token");
    const response = await fetch("http://localhost:8080/api/paysummaries/calculate-monthly", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeCodes: param.employeeCode,
        month: param.date + "-01"
      })
    });

    if (response.ok) {
      const data: CreateDraftResponse = await response.json();
      return data;
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    console.error("Error creating draft:", error);
    throw error;
  }
};