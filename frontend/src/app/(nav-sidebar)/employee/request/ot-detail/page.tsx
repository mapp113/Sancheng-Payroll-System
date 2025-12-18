"use client";

import OTDetail from "@/app/_components/employee/request/overtime/detail";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { OTResponseData } from "@/app/_components/employee/request/types";
import DeleteConfirmation from "@/app/_components/common/pop-box/delete-confirmation";
import SuccessNotification from "@/app/_components/common/pop-box/notification/success";
import ErrorNotification from "@/app/_components/common/pop-box/notification/error";

function OTDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [otData, setOtData] = useState<OTResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDelete = async () => {
    if (!id) return;

    try {
      const token = sessionStorage.getItem("scpm.auth.token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/overtime/myrequest/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSuccessMessage("Đã xóa yêu cầu OT thành công!");
        setTimeout(() => router.push("/employee/request"), 2000);
      } else {
        throw new Error("Xóa yêu cầu OT thất bại!");
      }
    } catch (error) {
      console.error("Error deleting OT request:", error);
      setErrorMessage(error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa yêu cầu OT!");
    }
  };
  
  return (
    <div className="relative flex min-h-full flex-col gap-6 p-6 text-[#1F2A44]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a href="./" className="cursor-pointer rounded-full border border-[#4AB4DE] bg-white px-4 py-2 text-sm font-semibold text-[#4AB4DE] transition hover:bg-[#F4FBFF]">
          Quay lại
        </a>
      </div>

      {/* Main Card */}
      <OTDetail otData={otData} loading={loading}>
        {otData?.status === "PENDING" && (
          <div className="flex justify-center">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="cursor-pointer rounded-full border border-red-500 bg-red-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Xóa yêu cầu
            </button>
          </div>
        )}
      </OTDetail>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        message="Bạn có chắc chắn muốn xóa yêu cầu OT này không?"
        itemName={otData ? `OT ngày ${new Date(otData.otDate).toLocaleDateString('vi-VN')}` : ""}
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

export default function OTDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTDetailContent />
    </Suspense>
  );
}