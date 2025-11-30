"use client";

import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

interface ErrorNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function ErrorNotification({
  isOpen,
  onClose,
  message,
  autoClose = false,
  autoCloseDelay = 5000
}: ErrorNotificationProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="flex items-start gap-3 p-4 bg-white border-l-4 border-red-500 rounded-lg shadow-xl max-w-md">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Lỗi!</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
