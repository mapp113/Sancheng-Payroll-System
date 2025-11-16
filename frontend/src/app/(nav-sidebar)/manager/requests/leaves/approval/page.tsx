"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { File } from "lucide-react";
import type { LeaveDetailResponse } from "@/app/_components/employee/request/types";

export default function ManagerApprovalLeavesPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [leaveData, setLeaveData] = useState<LeaveDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const handleApprove = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/leave/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error("Không thể phê duyệt");
      }

      alert("Đã phê duyệt thành công");
      window.location.href = "./";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

  const handleReject = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/leave/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error("Không thể từ chối");
      }

      alert("Đã từ chối yêu cầu");
      window.location.href = "./";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Không tìm thấy ID");
      setLoading(false);
      return;
    }

    const fetchLeaveDetail = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch(`http://localhost:8080/api/leave/detail/${id}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }); // Thay đổi URL API theo backend của bạn
        
        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu");
        }
        
        const data: LeaveDetailResponse = await response.json();
        setLeaveData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveDetail();
  }, [id]);

  if (loading) {
    return <div className="p-4 text-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!leaveData) {
    return <div className="p-4 text-center">Không tìm thấy dữ liệu</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <a className="w-fit h-fit border border-black bg-[#8acefd] text-[#4577a0] hover:bg-[#66befc] py-2 px-4 rounded cursor-pointer"
        href="./">
        Back
      </a>
      <div className="flex justify-center">
        <div className="w-[60rem] bg-[#d5f1f5] rounded-2xl py-5 px-10">
          <h1 className="text-2xl font-bold text-center mb-6">Yêu cầu xin nghỉ</h1>
          
          <div className="flex flex-col gap-3">
            <div className="flex">
              <div className="w-1/3">
                <strong>Mã nhân viên:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.employeeCode}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Tên nhân viên:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.fullName}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Loại nghỉ:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.leaveTypeCode}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Ngày bắt đầu:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.fromDate}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Ngày kết thúc:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.toDate}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Thời gian:</strong>
              </div>
              <div className="w-2/3">
                {leaveData.duration}
              </div>
            </div>

            <div className="flex">
              <div className="w-1/3">
                <strong>Lí do:</strong>
              </div>
              <div className="w-2/3 bg-[#7aeade] rounded-2xl px-4 py-3 min-h-[100px]">
                {leaveData.reason}
              </div>
            </div>

            {leaveData.file && (
              <div className="flex">
                <div className="w-1/3">
                  <File />
                </div>
                <div className="w-2/3">
                  <a href={leaveData.file} className="text-blue-600 underline">Xem file</a>
                </div>
              </div>
            )}

            <div className="flex">
              <div className="w-1/3">
                <strong>Trạng thái:</strong>
              </div>
              <div className="w-2/3 font-semibold">
                {leaveData.status}
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2">
                <strong>Thông báo:</strong>
              </div>
              <textarea
                value={leaveData.note ? leaveData.note : note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#7adfeb] rounded-2xl px-4 py-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>
            {leaveData.status !== 'APPROVED' && leaveData.status !== 'REJECTED' && (
            <div className="flex gap-4 justify-center mt-6">
              <button 
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded cursor-pointer"
              >
              Đồng ý
              </button>
              <button 
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded cursor-pointer"
              >
              Từ chối
              </button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
