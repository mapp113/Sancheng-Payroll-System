"use client";

import OTDetail from "@/app/_components/employee/request/overtime/detail";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { OTResponseData } from "@/app/_components/employee/request/types";
import RequestConfirmation from "@/app/_components/common/pop-box/request-confirmation";
import SuccessNotification from "@/app/_components/common/pop-box/notification/success";
import ErrorNotification from "@/app/_components/common/pop-box/notification/error";

function OTApprovalContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [otData, setOtData] = useState<OTResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchOTDetail() {
      if (!id) return;

      try {
        const token = sessionStorage.getItem("scpm.auth.token");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/detail/${id}`, {
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

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/approve/${id}?note=${encodeURIComponent(note)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Đã duyệt yêu cầu làm thêm giờ thành công!");
        setTimeout(() => router.push("/manager/requests/overtime"), 2000);
      } else {
        throw new Error("Duyệt yêu cầu OT thất bại!");
      }
    } catch (error) {
      console.error("Error approving OT request:", error);
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra khi duyệt yêu cầu OT!");
    }
  };

  const handleReject = async () => {
    if (!id) return;

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/reject/${id}?note=${encodeURIComponent(note)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Đã từ chối yêu cầu làm thêm giờ!");
        setTimeout(() => router.push("/manager/requests/overtime"), 2000);
      } else {
        throw new Error("Từ chối yêu cầu OT thất bại!");
      }
    } catch (error) {
      console.error("Error rejecting OT request:", error);
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra khi từ chối yêu cầu OT!");
    }
  };

  const handleBack = () => {
    const page = searchParams.get("page") || "0";
    const month = searchParams.get("month") || "";
    const search = searchParams.get("search") || "";
    
    const params = new URLSearchParams();
    params.set("page", page);
    if (month) params.set("month", month);
    if (search) params.set("search", search);
    
    router.push(`/manager/requests/overtime?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-between p-4">
      <div className="w-full">
        <button 
          onClick={handleBack}
          className="w-fit h-fit border border-black bg-[#8acefd] text-[#4577a0] hover:bg-[#66befc] py-2 px-4 rounded cursor-pointer"
        >
          Back
        </button>
      </div>
      
      <OTDetail 
        otData={otData} 
        loading={loading}
        note={note}
        onNoteChange={setNote}
        isEditable={otData?.status === "PENDING"}
      >
        {otData?.status === "PENDING" && (() => {
          const userStr = sessionStorage.getItem("scpm.auth.user");
          if (!userStr) return null;
          try {
            const user = JSON.parse(userStr);
            if (user.role !== 'MANAGER') return null;
          } catch {
            return null;
          }
          return (
            <div className="w-full flex items-center justify-center gap-4">
              <button
                onClick={() => setShowApproveConfirm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => setShowRejectConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Reject
              </button>
            </div>
          )
        })()}
      </OTDetail>

      {/* Confirmation Dialogs */}
      <RequestConfirmation
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        type="approve"
        requestType="overtime"
      />
      <RequestConfirmation
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={handleReject}
        type="reject"
        requestType="overtime"
      />

      {/* Notifications */}
      <SuccessNotification
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage("")}
        message={successMessage}
      />
      <ErrorNotification
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
      />
    </div>
  );
}

export default function OTApprovalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTApprovalContent />
    </Suspense>
  );
}