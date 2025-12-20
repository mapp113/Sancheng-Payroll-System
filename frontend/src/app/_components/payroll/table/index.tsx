import { FormEvent, useContext, useEffect } from "react";
import { DataContext, ParamsContext } from "../payroll-context";
import { PayrollQuery } from "../query";
import { Search } from "lucide-react";
import Pagination from "./pagination";
import { useNotification } from "../../common/pop-box/notification/notification-context";
import { formatNumber } from "../../utils/formatNumber";
import { mapStatus, vietnameseToStatusCode } from "../../utils/statusMapping";
import FilterButton from "../toolbar/filter-button";


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

    const searchHandler = async (e: FormEvent<HTMLInputElement>) => {
        const inputValue = (e.target as HTMLInputElement).value;
        
        // Giữ nguyên giá trị user nhập vào state
        payrollParams.setPayrollParams({
            ...payrollParams.payrollParams,
            keyword: inputValue,
        });
        
        // Chỉ convert sang status code khi gọi API
        const searchKeyword = vietnameseToStatusCode(inputValue);
        const newParams = {
            ...payrollParams.payrollParams,
            keyword: searchKeyword,
        };

        const data = await PayrollQuery(newParams);
        payrollData.setPayrollData(data.content);

        payrollParams.setPayrollParams((prev) => ({
            ...prev,
            totalPage: data.size.toString(),
        }));
    };

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
        <div className="h-full w-full flex flex-col">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="relative flex items-center">
                        <Search className="absolute left-3 h-4 w-4 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm"
                            className="w-full rounded-full border border-[#E2E8F0] py-2 pl-9 pr-3 text-sm focus:border-[#4AB4DE] focus:outline-none"
                            onInput={searchHandler}
                        />
                    </label>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-full border border-[#E2E8F0] px-3 py-2">
                        <input
                            type="month"
                            className="focus:outline-0 text-sm bg-transparent"
                            defaultValue={payrollParams?.payrollParams.date}
                            onInput={async (e: FormEvent<HTMLInputElement>) => {
                                if (!payrollParams) return;
                                payrollParams.setPayrollParams({
                                    ...payrollParams.payrollParams,
                                    date: (e.target as HTMLInputElement).value,
                                    totalPage: payrollParams.payrollParams.totalPage,
                                });
                                const newParams = {
                                    ...payrollParams.payrollParams,
                                    date: (e.target as HTMLInputElement).value,
                                    totalPage: payrollParams.payrollParams.totalPage,
                                };

                                const data = await PayrollQuery(newParams);
                                payrollData.setPayrollData(data.content);
                                payrollParams.setPayrollParams((prev) => ({
                                    ...prev,
                                    totalPage: data.size.toString(),
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl border border-[#E2E8F0]">
                <table className="min-w-full divide-y divide-[#E2E8F0] text-sm">
                    <thead className="bg-[#F8FAFC] text-left">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mã Nhân Viên</th>
                            <th className="px-4 py-3 font-medium">Họ Và Tên</th>
                            <th className="px-4 py-3 font-medium">Chức vụ</th>
                            <th className="px-4 py-3 font-medium">Lương</th>
                            <th className="px-4 py-3 font-medium">Trạng thái</th>
                            <th className="px-4 py-3 font-medium">Phiếu lương</th>
                            <th className="px-4 py-3 font-medium"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E2E8F0]">
                    {payrollData.payrollData.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500">
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        payrollData.payrollData.map((record) => (
                        <tr key={record.employeeCode} className="hover:bg-[#F1F5F9]">
                            <td className="whitespace-nowrap px-4 py-3 font-medium">{record.employeeCode}</td>
                            <td className="whitespace-nowrap px-4 py-3">{record.fullName}</td>
                            <td className="whitespace-nowrap px-4 py-3">{record.positionName}</td>
                            <td className="whitespace-nowrap px-4 py-3">{formatNumber(record.netSalary)}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <span
                                    className={`py-3 px-4`}
                                >{mapStatus(record.status)}</span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
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
                                className="rounded-full bg-[#4AB4DE] px-3 py-1 text-xs font-medium text-white hover:bg-[#3a9bc5] transition-colors cursor-pointer"
                            >
                                Tải về
                            </button>
                        </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                                <a href={`/payroll-detail?employeeCode=${record.employeeCode}&month=${payrollParams.payrollParams.date}&page=${payrollParams.payrollParams.page}${payrollParams.payrollParams.keyword ? `&search=${encodeURIComponent(payrollParams.payrollParams.keyword)}` : ''}${payrollParams.payrollParams.sortBy ? `&sortBy=${encodeURIComponent(payrollParams.payrollParams.sortBy)}` : ''}`}
                                   className="inline-block rounded-full border border-[#4AB4DE] px-4 py-1 text-xs font-medium text-[#4AB4DE] hover:bg-[#E0F2FE] cursor-pointer">Chi tiết</a>
                            </td>
                        </tr>
                    )))
                    }
                    </tbody>
                </table>
            </div>
            {payrollData.payrollData.length > 0 && <Pagination/>}
        </div>
    );
}
