"use client";

import OTDetail from "@/app/_components/employee/request/overtime/detail";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OTResponseData } from "@/app/_components/employee/request/types";

export default function OTApprovalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [otData, setOtData] = useState<OTResponseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOTDetail() {
      if (!id) return;
      
      try {
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch(`http://localhost:8080/api/overtime/detail/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOtData(data);
        }
      } catch (error) {
        console.error("Error fetching OT detail:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOTDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    
    const confirmed = confirm("Bạn có chắc chắn muốn duyệt yêu cầu OT này?");
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`http://localhost:8080/api/overtime/approve/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Duyệt yêu cầu OT thành công!");
        router.push("/manager/requests/overtime");
      } else {
        alert("Duyệt yêu cầu OT thất bại!");
      }
    } catch (error) {
      console.error("Error approving OT request:", error);
      alert("Có lỗi xảy ra khi duyệt yêu cầu OT!");
    }
  };

  const handleReject = async () => {
    if (!id) return;
    
    const confirmed = confirm("Bạn có chắc chắn muốn từ chối yêu cầu OT này?");
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`http://localhost:8080/api/overtime/reject/${id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Từ chối yêu cầu OT thành công!");
        router.push("/manager/requests/overtime");
      } else {
        alert("Từ chối yêu cầu OT thất bại!");
      }
    } catch (error) {
      console.error("Error rejecting OT request:", error);
      alert("Có lỗi xảy ra khi từ chối yêu cầu OT!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between p-4">
      <div className="w-full">
        <a href="./" className="w-fit h-fit border border-black bg-[#8acefd] text-[#4577a0] hover:bg-[#66befc] py-2 px-4 rounded cursor-pointer" >Back</a>
      </div>
      <OTDetail otData={otData} loading={loading}>
        {otData?.status === "PENDING" && (
          <div className="w-full flex items-center justify-center gap-4">
            <button 
              onClick={handleApprove}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Approve
            </button>
            <button 
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Reject
            </button>
          </div>
        )}
      </OTDetail>
    </div>
  );
}