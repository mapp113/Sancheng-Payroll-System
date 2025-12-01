"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface RequestConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  type: "approve" | "reject";
  requestType: "leave" | "overtime";
  title?: string;
}

export default function RequestConfirmation({
  isOpen,
  onClose,
  onConfirm,
  type,
  requestType,
  title
}: RequestConfirmationProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isApprove = type === "approve";
  const requestLabel = requestType === "leave" ? "nghỉ phép" : "làm thêm giờ";

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error during confirmation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="h-full w-full fixed flex justify-center items-center top-0 left-0 bg-black/30 z-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-2xl shadow-xl mx-4">
        <div className="space-y-4">
          {/* Header with Icon */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            {isApprove ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {title || (isApprove 
                ? `Xác nhận duyệt yêu cầu ${requestLabel}`
                : `Xác nhận từ chối yêu cầu ${requestLabel}`
              )}
            </h2>
          </div>

          {/* Message */}
          <div className="py-2">
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                {isApprove 
                  ? `Bạn có chắc chắn muốn duyệt yêu cầu ${requestLabel} này không?`
                  : `Bạn có chắc chắn muốn từ chối yêu cầu ${requestLabel} này không?`
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                isApprove 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? "Đang xử lý..." : (isApprove ? "Duyệt" : "Từ chối")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
