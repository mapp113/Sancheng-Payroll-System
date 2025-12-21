"use client";

import { useEffect, useState } from "react";
import { Clock4, TimerReset } from "lucide-react";
import type { AttendanceDaily } from "@/app/_components/manager-timesheet-detail/types";
import { getLeaveTypeName } from "../utils/leaveTypeMapping";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

interface AttendanceTableProps {
  employeeCode: string;
  month: string; // YYYY-MM format
  onDayClick?: (data: AttendanceDaily) => void;
}

interface TableEntry {
  id: string;
  day: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number | null;
  overtimeHours: number | null;
  note?: string;
  type: "work" | "leave";
}

export default function AttendanceTable({ employeeCode, month, onDayClick }: AttendanceTableProps) {
  const [attendanceDaily, setAttendanceDaily] = useState<AttendanceDaily[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchAttendanceDaily = async () => {
      if (!employeeCode || !month) return;

      setIsLoading(true);
      setHasError(false);
      try {
        const token = localStorage.getItem("access_token");
        const monthParam = `${month}-01`;
        const response = await fetch(
          `${API_BASE_URL}/api/attsummary/by-month?employeeCode=${employeeCode}&month=${monthParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          setHasError(true);
          setAttendanceDaily([]);
          return;
        }

        const data: AttendanceDaily[] = await response.json();
        setAttendanceDaily(data || []);
      } catch (error) {
        console.error("Error fetching attendance daily:", error);
        setHasError(true);
        setAttendanceDaily([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceDaily();
  }, [employeeCode, month]);

  const generateMonthDays = (monthStr: string): TableEntry[] => {
    const [year, monthNum] = monthStr.split("-").map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const days: TableEntry[] = [];
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum - 1, day);
      const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
      const dayName = dayNames[date.getDay()];

      // Kiểm tra xem ngày này có trong tương lai không
      const isFutureDate = date > currentDate;

      const dailyData = attendanceDaily.find((d) => d.date === dateStr);

      if (dailyData) {
        if (dailyData.isAbsent) {
          days.push({
            id: dateStr,
            day: dayName,
            date: `${String(day).padStart(2, "0")}/${String(monthNum).padStart(2, "0")}/${year}`,
            type: "leave",
            note: "Nghỉ không phép",
            checkIn: null,
            checkOut: null,
            workHours: null,
            overtimeHours: null,
          });
        } else if (dailyData.leaveTypeCode) {
          days.push({
            id: dateStr,
            day: dayName,
            date: `${String(day).padStart(2, "0")}/${String(monthNum).padStart(2, "0")}/${year}`,
            type: "leave",
            note: getLeaveTypeName(dailyData.leaveTypeCode),
            checkIn: null,
            checkOut: null,
            workHours: null,
            overtimeHours: null,
          });
        } else {
          const checkIn = dailyData.checkInTime
            ? dailyData.checkInTime.split("T")[1]?.substring(0, 5)
            : null;
          const checkOut = dailyData.checkOutTime
            ? dailyData.checkOutTime.split("T")[1]?.substring(0, 5)
            : null;

          days.push({
            id: dateStr,
            day: dayName,
            date: `${String(day).padStart(2, "0")}/${String(monthNum).padStart(2, "0")}/${year}`,
            checkIn: checkIn,
            checkOut: checkOut,
            workHours: dailyData.workHours,
            overtimeHours: dailyData.otHour,
            type: "work",
          });
        }
      } else {
        // Nếu là ngày trong tương lai, hiển thị "Không có dữ liệu"
        // Nếu là ngày trong quá khứ, hiển thị "Ngày nghỉ"
        days.push({
          id: dateStr,
          day: dayName,
          date: `${String(day).padStart(2, "0")}/${String(monthNum).padStart(2, "0")}/${year}`,
          type: "leave",
          note: isFutureDate ? "Không có dữ liệu" : "Ngày nghỉ",
          checkIn: null,
          checkOut: null,
          workHours: null,
          overtimeHours: null,
        });
      }
    }

    return days;
  };

  const allDays = generateMonthDays(month);

  const formatTime = (time: string | null) => {
    if (!time) return "--";
    return time;
  };

  const formatHours = (hours: number | null) => {
    if (hours === null || hours === undefined) return "--";
    return `${hours.toFixed(2)}h`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (hasError || attendanceDaily.length === 0) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#CCE1F0]">
        <table className="min-w-full divide-y divide-[#CCE1F0] text-sm">
          <thead className="bg-[#EAF5FF] text-xs uppercase tracking-widest text-[#345EA8]">
            <tr>
              <th className="px-4 py-3 text-left">Ngày</th>
              <th className="px-4 py-3 text-left">Check in</th>
              <th className="px-4 py-3 text-left">Check out</th>
              <th className="px-4 py-3 text-left">Giờ làm việc</th>
              <th className="px-4 py-3 text-left">Tăng ca</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                Không có thông tin chấm công
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[#CCE1F0]">
      <table className="min-w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <thead className="bg-[#EAF5FF] text-xs uppercase tracking-widest text-[#345EA8]">
          <tr>
            <th className="px-4 py-3 text-left" style={{ width: '15%' }}>Ngày</th>
            <th className="px-4 py-3 text-center" style={{ width: '15%' }}>Check in</th>
            <th className="px-4 py-3 text-center" style={{ width: '15%' }}>Check out</th>
            <th className="px-4 py-3 text-center" style={{ width: '20%' }}>Giờ làm việc</th>
            <th className="px-4 py-3 text-center" style={{ width: '15%' }}>Tăng ca</th>
            <th className="px-4 py-3 text-left" style={{ width: '20%' }}></th>
          </tr>
        </thead>
      </table>
      <div className="max-h-[600px] overflow-y-auto">
        <table className="min-w-full text-sm" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <tbody className="divide-y divide-[#F0F6FB] bg-white text-[#1F2A44]">
            {allDays.map((entry) => {
              const dailyData = attendanceDaily.find((d) => d.date === entry.id);
              const isLeave = entry.type === "leave";
              const isDefaultLeave = entry.note === "Ngày nghỉ";
              const isNoData = entry.note === "Không có dữ liệu";

              return (
                <tr key={entry.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{entry.day}</p>
                    <p className="text-xs text-[#1F2A44]/60">{entry.date}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isLeave ? (
                      <span>--</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Clock4 className="h-4 w-4 text-[#4AB4DE]" />
                        <span>{formatTime(entry.checkIn)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isLeave ? (
                      <span>--</span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <TimerReset className="h-4 w-4 text-[#4AB4DE]" />
                        <span>{formatTime(entry.checkOut)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isLeave ? (
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                        isNoData 
                          ? 'bg-gray-100 text-gray-500' 
                          : 'bg-[#FFEFD6] text-[#B45309]'
                      }`}>
                        {entry.note}
                      </span>
                    ) : (
                      formatHours(entry.workHours)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isLeave ? "--" : formatHours(entry.overtimeHours)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isDefaultLeave && !isNoData && dailyData && onDayClick && (
                      <button
                        type="button"
                        onClick={() => onDayClick(dailyData)}
                        className="inline-flex items-center justify-center rounded-full border border-[#4AB4DE] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1D3E6A] transition hover:bg-[#E6F7FF] cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
