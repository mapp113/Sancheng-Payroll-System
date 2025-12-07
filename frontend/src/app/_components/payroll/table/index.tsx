import { useContext, useEffect } from "react";
import { DataContext, ParamsContext } from "../payroll-context";
import { PayrollQuery } from "../query";
import { Info } from "lucide-react";
import Pagination from "./pagination";
import { useNotification } from "../../common/pop-box/notification/notification-context";
import { formatNumber } from "../../utils/formatNumber";
import { mapStatus } from "../../utils/statusMapping";


export default function PayrollTable() {
    const payrollParams = useContext(ParamsContext)!;
    const payrollData = useContext(DataContext)!;
    const {addNotification} = useNotification();
    ;

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <h1 className="text-xl font-bold mb-5">Bảng lương nhân viên</h1>
            <table className="w-full border-collapse text-sm text-gray-800">
                <thead>
                <tr className="bg-[#CCE1F0] text-left rounded-t-xl">
                    <th className="py-3 px-4 font-semibold rounded-tl-xl">Mã Nhân Viên</th>
                    <th className="py-3 px-4 font-semibold">Họ Và Tên</th>
                    <th className="py-3 px-4 font-semibold">Chức vụ</th>
                    <th className="py-3 px-4 font-semibold">Lương</th>
                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                    <th className="py-3 px-4 font-semibold">Phiếu lương</th>
                    <th className="py-3 px-4 rounded-tr-xl"></th>
                </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                {payrollData.payrollData.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                            Không có dữ liệu
                        </td>
                    </tr>
                ) : (
                    payrollData.payrollData.map((record) => (
                    <tr key={record.employeeCode} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{record.employeeCode}</td>
                        <td className="py-3 px-4">{record.fullName}</td>
                        <td className="py-3 px-4">{record.positionName}</td>
                        <td className="py-3 px-4">{formatNumber(record.netSalary)}</td>
                        <td className="py-3 px-4">
                                <span
                                    className={`py-3 px-4`}
                                >{mapStatus(record.status)}</span>
                            </td>
                            <td className="py-3 px-4">
                                <button 
                                    onClick={() => {
                                        const downloadUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/paysummaries/download?employeeCode=${record.employeeCode}&month=${payrollParams.payrollParams.date}-01`;
                                        const token = sessionStorage.getItem("scpm.auth.token"); // or however you store your token
                                        fetch(downloadUrl, {
                                            headers: {
                                                'Authorization': `Bearer ${token}`
                                            }
                                        })
                                        .then(response => {
                                            if (response.ok) {
                                                return response.blob();
                                            }
                                            throw new Error('Download failed');
                                        })
                                        .then(blob => {
                                            const url = window.URL.createObjectURL(blob);
                                            window.open(url, '_blank');
                                            window.URL.revokeObjectURL(url);
                                        })
                                        .catch(error => {
                                            console.error('Error downloading file:', error);
                                            addNotification(
                                                "error",
                                                "Tải xuống thất bại",
                                                "Không thể tải phiếu lương. Vui lòng thử lại.",
                                                5000
                                            );
                                        });
                                }}
                                className="bg-cyan-300 hover:bg-cyan-400 text-sm text-gray-800 font-medium py-1 px-3 rounded-md shadow"
                            >
                                Tải về
                            </button>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                            <a href={`/payroll-detail?employeeCode=${record.employeeCode}&month=${payrollParams.payrollParams.date}&page=${payrollParams.payrollParams.page}${payrollParams.payrollParams.keyword ? `&search=${encodeURIComponent(payrollParams.payrollParams.keyword)}` : ''}${payrollParams.payrollParams.sortBy ? `&sortBy=${encodeURIComponent(payrollParams.payrollParams.sortBy)}` : ''}`}
                               className="cursor-pointer"><Info size={18}/></a>
                        </td>
                    </tr>
                )))
                }
                </tbody>
            </table>
            {payrollData.payrollData.length > 0 && <Pagination/>}
        </div>
    );
}
