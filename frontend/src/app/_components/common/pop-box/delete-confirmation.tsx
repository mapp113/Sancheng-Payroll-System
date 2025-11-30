"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
  itemName?: string;
}

export default function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa yêu cầu này không?",
  itemName
}: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error during deletion:", error);
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
            <Trash2 className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-800">
              {title}
            </h2>
          </div>

          {/* Warning Message */}
          <div className="py-2">
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">
                  {message}
                </p>
                {itemName && (
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Mục: </span>{itemName}
                  </p>
                )}
                <p className="text-xs text-red-600 mt-2">
                  Hành động này không thể hoàn tác.
                </p>
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
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
