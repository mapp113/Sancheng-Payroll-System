import { useContext } from "react";
import { ParamsContext } from "../payroll-context";
import { CloudUpload } from "lucide-react";
import { useNotification } from "../../common/pop-box/notification/notification-context";

export default function PayrollToolbar() {
  const params = useContext(ParamsContext);
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

  return (
    <button
      className="rounded-full bg-[#4AB4DE] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a9bc5] transition-colors cursor-pointer flex items-center gap-2"
      onClick={exportButtonHandler}
    >
      <CloudUpload className="h-4 w-4" />
      Xuất sang Excel
    </button>
  );
}
