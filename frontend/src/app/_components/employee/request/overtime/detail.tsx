import { OTResponseData } from "../types";

interface OTDetailProps {
  otData: OTResponseData | null;
  loading: boolean;
  children: React.ReactNode;
  note?: string;
  onNoteChange?: (note: string) => void;
  isEditable?: boolean;
}

export default function OTDetail({ otData, loading, children, note = "", onNoteChange, isEditable = false }: OTDetailProps) {
  
  
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-center text-[#1F2A44]/60">Đang tải...</p>
      </div>
    );
  }

  if (!otData) {
    return (
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-center text-[#1F2A44]/60">Không tìm thấy dữ liệu</p>
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600";
      case "APPROVED":
        return "text-green-600";
      case "REJECTED":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-semibold text-[#1F2A44]">Chi tiết yêu cầu OT</h1>

      <div className="flex flex-col gap-4">
        {/* Ngày làm thêm */}
        <div className="flex">
          <label className="w-1/3 text-sm font-medium text-[#1F2A44]/60">Ngày làm thêm:</label>
          <input
            type="date"
            disabled
            value={otData.otDate}
            className="flex-1 rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-3 py-2 text-sm text-[#1F2A44]"
          />
        </div>

        {/* Thời gian */}
        <div className="flex">
          <label className="w-1/3 text-sm font-medium text-[#1F2A44]/60">Thời gian:</label>
          <div className="flex flex-1 items-center gap-2">
            <span className="text-sm text-[#1F2A44]">Từ</span>
            <input
              type="time"
              disabled
              value={otData.fromTime.substring(11, 16)}
              className="rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-3 py-2 text-sm text-[#1F2A44]"
            />
            <span className="text-sm text-[#1F2A44]">Đến</span>
            <input
              type="time"
              disabled
              value={otData.toTime.substring(11, 16)}
              className="rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-3 py-2 text-sm text-[#1F2A44]"
            />
          </div>
        </div>

        {/* Tổng */}
        <div className="flex">
          <label className="w-1/3 text-sm font-medium text-[#1F2A44]/60">Tổng:</label>
          <input
            type="text"
            disabled
            value={`${otData.workedTime} giờ`}
            className="flex-1 rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-3 py-2 text-sm font-semibold text-[#4AB4DE]"
          />
        </div>

        {/* Loại OT */}
        <div className="flex">
          <label className="w-1/3 text-sm font-medium text-[#1F2A44]/60">Loại OT:</label>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <input type="radio" id="weekday" name="otType" disabled checked={otData.dayTypeId === 1} className="text-[#4AB4DE]" />
              <label htmlFor="weekday" className="text-sm text-[#1F2A44]">Ngày Thường</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="radio" id="weekend" name="otType" disabled checked={otData.dayTypeId === 2} className="text-[#4AB4DE]" />
              <label htmlFor="weekend" className="text-sm text-[#1F2A44]">Thứ 7/ Chủ Nhật</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="radio" id="holiday" name="otType" disabled checked={otData.dayTypeId === 3} className="text-[#4AB4DE]" />
              <label htmlFor="holiday" className="text-sm text-[#1F2A44]">Ngày Lễ</label>
            </div>
          </div>
        </div>

        {/* Lý do */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-[#1F2A44]/60">Lý do:</label>
          <textarea
            disabled
            rows={4}
            value={otData.reason}
            className="w-full rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-3 py-2 text-sm text-[#1F2A44] resize-none"
          />
        </div>

        {/* Trạng thái */}
        <div className="flex">
          <label className="w-1/3 text-sm font-medium text-[#1F2A44]/60">Trạng thái:</label>
          <span className={`font-semibold ${getStatusColor(otData.status)}`}>
            {getStatusText(otData.status)}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-[#1F2A44]/60">Thông báo từ quản lý:</label>
          <textarea
            disabled={!isEditable}
            rows={4}
            value={isEditable ? note : (otData.note || "")}
            onChange={(e) => isEditable && onNoteChange?.(e.target.value)}
            className="w-full rounded-xl border border-[#CCE1F0] bg-[#F4FBFF] px-3 py-2 text-sm text-[#1F2A44] resize-none"
            placeholder={isEditable ? "Nhập thông báo cho yêu cầu OT..." : "Chưa có thông báo"}
          />
        </div>

        <div className="mt-4 w-full">
          {children}
        </div>
      </div>
    </section>
  );
}