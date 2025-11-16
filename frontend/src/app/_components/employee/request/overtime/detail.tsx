import { OTResponseData } from "../types";

interface OTDetailProps {
  otData: OTResponseData | null;
  loading: boolean;
  children: React.ReactNode;
}

export default function OTDetail({ otData, loading, children }: OTDetailProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-lg p-8">
        <p className="text-center">Đang tải...</p>
      </div>
    );
  }

  if (!otData) {
    return (
      <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-lg p-8">
        <p className="text-center">Không tìm thấy dữ liệu</p>
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
    <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-lg p-8">
          <h1 className="text-xl font-semibold mb-6 text-center">Yêu cầu xin OT</h1>

          <div className="space-y-4">
            {/* Ngày làm thêm */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Ngày làm thêm:</label>
              <input
                type="date"
                disabled
                value={otData.otDate}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-200/50 border-0"
              />
            </div>

            {/* Thời gian */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Thời gian:</label>
              <div className="flex-1 flex items-center gap-2">
                <span className="font-medium">Từ</span>
                <input
                  type="time"
                  disabled
                  value={otData.fromTime.substring(0, 5)}
                  className="px-4 py-2 rounded-lg bg-cyan-200/50 border-0"
                />
                <span className="font-medium">Đến</span>
                <input
                  type="time"
                  disabled
                  value={otData.toTime.substring(0, 5)}
                  className="px-4 py-2 rounded-lg bg-cyan-200/50 border-0"
                />
              </div>
            </div>

            {/* Tổng */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Tổng:</label>
              <input
                type="text"
                disabled
                value={`${otData.workedTime} giờ`}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-200/50 border-0"
              />
            </div>

            {/* Loại OT */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Loại OT (OT Type):</label>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <input type="radio" id="weekday" name="otType" disabled checked={otData.dayTypeId === 1} />
                  <label htmlFor="weekday">Ngày Thường</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="radio" id="weekend" name="otType" disabled checked={otData.dayTypeId === 2} />
                  <label htmlFor="weekend">Thứ 7/ Chủ Nhật</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="radio" id="holiday" name="otType" disabled checked={otData.dayTypeId === 3} />
                  <label htmlFor="holiday">Ngày Lễ</label>
                </div>
              </div>
            </div>

            {/* Lý do */}
            <div className="flex gap-4">
              <label className="w-32 font-medium">Lý do:</label>
              <textarea
                disabled
                rows={4}
                value={otData.reason}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-200/50 border-0 resize-none"
              />
            </div>

            {/* Trạng thái */}
            <div className="flex items-center gap-4">
              <label className="w-32 font-medium">Trạng thái:</label>
              <span className={`px-4 py-2 rounded-lg bg-cyan-200/50 font-semibold ${getStatusColor(otData.status)}`}>
                {getStatusText(otData.status)}
              </span>
            </div>

            <div className="w-full">
              {children}
            </div>
          </div>
        </div>
  );
}