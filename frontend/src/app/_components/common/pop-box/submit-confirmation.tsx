"use client";

import { useState } from "react";
import { Send, AlertCircle } from "lucide-react";

interface SubmitConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  details?: string;
}

export default function SubmitConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận gửi yêu cầu",
  message = "Bạn có chắc chắn muốn gửi yêu cầu này không?",
  details
}: SubmitConfirmationProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="h-full w-full fixed flex justify-center items-center top-0 left-0 bg-black/30 z-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl mx-4">
        <div className="space-y-4">
          {/* Header with Icon */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <Send className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              {title}
            </h2>
          </div>

          {/* Message */}
          <div className="py-2">
            <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 font-medium">
                  {message}
                </p>
                {details && (
                  <p className="text-sm text-blue-700 mt-2">
                    {details}
                  </p>
                )}
              </div>
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
