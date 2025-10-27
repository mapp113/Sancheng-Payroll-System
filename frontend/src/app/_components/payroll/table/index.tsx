import { useContext, useEffect } from "react";
import { DataContext, ParamsContext } from "../payroll-context";
import { PayrollQuery } from "../query";
import { Info } from "lucide-react";
import Pagination from "./pagination";


export default function PayrollTable() {
  const payrollParams = useContext(ParamsContext)!;
  const payrollData = useContext(DataContext)!;

  useEffect(() => {
    PayrollQuery(payrollParams.payrollParams).then((data) => {
      payrollData.setPayrollData(data.content);
      payrollParams.setPayrollParams({
        ...payrollParams.payrollParams,
        totalPage: data.size.toString(),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "green":
        return "bg-green-400";
      case "yellow":
        return "bg-yellow-400";
      case "red":
        return "bg-red-400";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-black">
      <h1 className="text-xl font-bold mb-5">Employees Payroll</h1>
      <table className="w-full border-collapse text-sm text-gray-800">
        <thead>
          <tr className="bg-[#CCE1F0] text-left rounded-t-xl">
            <th className="py-3 px-4 font-semibold rounded-tl-xl">ID</th>
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Position</th>
            <th className="py-3 px-4 font-semibold">Salary</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Payslip</th>
            <th className="py-3 px-4 rounded-tr-xl"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {payrollData.payrollData.map((record) => (
            <tr key={record.employeeCode} className="hover:bg-gray-50">
              <td className="py-3 px-4">{record.employeeCode}</td>
              <td className="py-3 px-4">{record.fullName}</td>
              <td className="py-3 px-4">{record.positionName}</td>
              <td className="py-3 px-4">${record.netSalary}</td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block w-4 h-4 rounded-full ${getStatusColor(
                    record.status
                  )}`}
                ></span>
              </td>
              <td className="py-3 px-4">
                <button className="bg-cyan-300 hover:bg-cyan-400 text-sm text-gray-800 font-medium py-1 px-3 rounded-md shadow">
                  Download
                </button>
              </td>
              <td className="py-3 px-4 text-gray-500">
                <Info size={18} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination />
    </div>
  );
}
